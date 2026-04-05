const socket = typeof io !== "undefined"
    ? io(window.location.origin.replace(/:\d+$/, ':3001'), {
        transports: ['websocket', 'polling']
      })
    : null;
const contentDiv = document.getElementById('app-content');
const homeBtn = document.getElementById('home-btn');
const aboutBtn = document.getElementById('about-btn');

const actionPanel = document.getElementById('action-panel');
const actionEdit = document.getElementById('action-edit');
const actionComplete = document.getElementById('action-complete');
const actionDelete = document.getElementById('action-delete');
const actionClose = document.getElementById('action-close');

const modal = document.getElementById('edit-modal');
const editText = document.getElementById('edit-text');
const saveEdit = document.getElementById('save-edit');
const cancelEdit = document.getElementById('cancel-edit');

let currentNoteId = null;
let currentNoteCard = null;

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setActiveButton(activeId) {
    [homeBtn, aboutBtn].forEach(btn => btn.classList.remove('active'));
    document.getElementById(activeId).classList.add('active');
}

async function loadContent(page) {
    try {
        const response = await fetch(`/content/${page}.html`);
        const html = await response.text();
        contentDiv.innerHTML = html;
        if (page === 'home') {
            initNotes();
        }
    } catch (err) {
        contentDiv.innerHTML = `<p class="is-center text-error">Ошибка загрузки страницы.</p>`;
        console.error(err);
    }
}

homeBtn.addEventListener('click', () => {
    setActiveButton('home-btn');
    loadContent('home');
});

aboutBtn.addEventListener('click', () => {
    setActiveButton('about-btn');
    loadContent('about');
});

loadContent('home');

function initNotes() {
    const form = document.getElementById('note-form');
    const input = document.getElementById('note-input');
    const reminderForm = document.getElementById('reminder-form');
    const reminderText = document.getElementById('reminder-text');
    const reminderTime = document.getElementById('reminder-time');
    const list = document.getElementById('notes-list');

    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        list.innerHTML = notes.map(note => {
            const completedClass = note.completed ? 'completed' : '';        
            let reminderInfo = '';
            if (note.reminder) {
                const date = new Date(note.reminder);
                reminderInfo = `<div class="note-reminder">
                    <img src="./icons/alarm-clock.png" alt="будильник" class="reminder-icon">
                    ${date.toLocaleString()}
                </div>`;
            }
            return `
                <div class="note-card ${completedClass}" data-id="${note.id}">
                    <img src="./icons/pins.png" alt="иконка" class="note-icon-img">
                    <img src="./icons/ellipsis.png" alt="меню" class="note-icon-right" data-id="${note.id}">
                    <div class="note-text">${escapeHtml(note.text)}</div>
                    ${reminderInfo}
                </div>
            `;
        }).join('');

        document.querySelectorAll('.note-icon-right').forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = icon.closest('.note-card');
                const id = parseInt(card.dataset.id);
                openActionPanel(id, card, icon); 
            });
        });
    }

    function saveNotes(notes) {
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();
    }

    function addNote(text,  reminderTimestamp = null) {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        const newNote = { id: Date.now(), text, reminder: reminderTimestamp};
        notes.push(newNote);
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();
        if (reminderTimestamp) {
            socket.emit('newReminder', {
                id: newNote.id,
                text: text,
                reminderTime: reminderTimestamp
            });
        } else {
            socket.emit('newTask', { text, timestamp: Date.now() });
        }
    }

    function openActionPanel(id, card, iconElement) {
        currentNoteId = id;
        currentNoteCard = card;
        const rect = iconElement.getBoundingClientRect();
        actionPanel.style.position = 'absolute';
        actionPanel.style.top = `${rect.bottom + window.scrollY + 5}px`;
        actionPanel.style.left = `${rect.right -148 + window.scrollX}px`;
        
        actionPanel.classList.add('show');
    }

    function closeActionPanel() {
        actionPanel.classList.remove('show');
        currentNoteId = null;
        currentNoteCard = null;
    }

    function editNote() {
        if (!currentNoteId) return;
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        const note = notes.find(n => n.id === currentNoteId);
        if (note) {
            editText.value = note.text;
            modal.style.display = 'flex';
            actionPanel.classList.remove('show');
        }
    }

    function saveEditNote() {
        if (!currentNoteId) return;
        const newText = editText.value.trim();
        if (!newText) return;
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        const note = notes.find(n => n.id === currentNoteId);
        if (note) {
            note.text = newText;
            saveNotes(notes);
        }
        modal.style.display = 'none';
        editText.value = '';
    }

    function completeNote() {
        if (!currentNoteId) return;
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        const note = notes.find(n => n.id === currentNoteId);
        if (note) {
            note.completed = !note.completed;
            saveNotes(notes);
        }
        closeActionPanel();
    }

    function deleteNote() {
        if (!currentNoteId) return;
        let notes = JSON.parse(localStorage.getItem('notes') || '[]');
        notes = notes.filter(n => n.id !== currentNoteId);
        saveNotes(notes);
        closeActionPanel();
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
            addNote(text);
            input.value = '';
        }
    });

    reminderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = reminderText.value.trim();
        const datetime = reminderTime.value;
        if (text && datetime) {
            const timestamp = new Date(datetime).getTime();
            if (timestamp > Date.now()) {
                addNote(text, timestamp);
                reminderText.value = '';
                reminderTime.value = '';
            } else {
                alert('Дата напоминания должна быть в будущем');
            }
        }
    });

    actionEdit.addEventListener('click', editNote);
    actionComplete.addEventListener('click', completeNote);
    actionDelete.addEventListener('click', deleteNote);
    actionClose.addEventListener('click', closeActionPanel);

    saveEdit.addEventListener('click', saveEditNote);
    cancelEdit.addEventListener('click', () => {
        modal.style.display = 'none';
        editText.value = '';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            editText.value = '';
        }
    });

    loadNotes();
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const reg = await navigator.serviceWorker.register('./sw.js');
            console.log('SW registered');
            
            const enableBtn = document.getElementById('enable-push');
            const disableBtn = document.getElementById('disable-push');
            
            if (enableBtn && disableBtn) {
                const subscription = await reg.pushManager.getSubscription();
                if (subscription) {
                    enableBtn.style.display = 'none';
                    disableBtn.style.display = 'inline-block';
                }

                enableBtn.addEventListener('click', async () => {
                    if (Notification.permission === 'denied') {
                        alert('Уведомления запрещены. Разрешите их в настройках браузера.');
                        return;
                    }

                    if (Notification.permission === 'default') {
                        const permission = await Notification.requestPermission();
                        if (permission !== 'granted') {
                            alert('Необходимо разрешить уведомления.');
                            return;
                        }
                    }

                    await subscribeToPush();
                    enableBtn.style.display = 'none';
                    disableBtn.style.display = 'inline-block';
                });

                disableBtn.addEventListener('click', async () => {
                    await unsubscribeFromPush();
                    disableBtn.style.display = 'none';
                    enableBtn.style.display = 'inline-block';
                });
            }
        } catch (err) {
            console.log('SW registration failed:', err);
        }
    });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4- base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g,'+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey:
            urlBase64ToUint8Array('BOMxzebJlumRKjRsPdeh0FY2wZ_FiuFOWf73-FtiQfoRyL-913llgWjbcvl7RH3zvXJpGnIqgTmdcC8KENdr01M')
        });

        const serverOrigin = window.location.origin.replace(/:\d+$/, ':3001');
        await fetch(`${serverOrigin}/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
        });
        console.log('Подписка на push отправлена');
    } catch (err) {
        console.error('Ошибка подписки на push:', err);
    }
}

async function unsubscribeFromPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
        const serverOrigin = window.location.origin.replace(/:\d+$/, ':3001');
        await fetch(`${serverOrigin}/unsubscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: subscription.endpoint })
        });
        
        await subscription.unsubscribe();
        console.log('Отписка выполнена');
    }
}

if (socket) {
    socket.on('taskAdded', (task) => {
        console.log('Задача от другого клиента:', task);
        const notification = document.createElement('div');
        notification.textContent = `Новая задача: ${task.text}`;
        notification.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background-color: antiquewhite;
            color: rgb(79, 70, 60);
            padding: 15px 25px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            border: 2px solid rgb(27, 25, 19);
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    });
} else {
    console.log('Socket не доступен (оффлайн режим)');
}