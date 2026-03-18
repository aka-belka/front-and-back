import React, { useState, useEffect } from 'react';
import { api } from '../api';
import UserItem from './UserItem';
import UserModal from './UserModal';

export default function UsersPage({ currentUser }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const handleDelete = async (userId) => {
        if (userId === currentUser?.id) {
            alert('Нельзя удалить самого себя');
            return;
        }

        if (window.confirm('Заблокировать пользователя?')) {
            try {
                await api.deleteUser(userId);
                setUsers(users.filter(u => u.id !== userId));
            } catch (error) {
                alert('Ошибка при блокировке пользователя');
            }
        }
    };

    const handleSubmit = async (userId, userData) => {
        try {
            const updatedUser = await api.updateUser(userId, userData);
            setUsers(users.map(u => u.id === userId ? updatedUser : u));
            setModalOpen(false);
        } catch (error) {
            alert('Ошибка при обновлении пользователя');
        }
    };

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div className="users-page">
            <div className="page-header">
                <h1>Управление пользователями</h1>
            </div>

            {users.length === 0 ? (
                <div className="empty">Пользователей нет</div>
            ) : (
                <div className="users-list">
                    {users.map(user => (
                        <UserItem
                            key={user.id}
                            user={user}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            currentUserId={currentUser?.id}
                        />
                    ))}
                </div>
            )}

            <UserModal
                open={modalOpen}
                user={selectedUser}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
            />
        </div>
    );
}