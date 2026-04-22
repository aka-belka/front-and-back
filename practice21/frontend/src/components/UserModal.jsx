import React, { useState, useEffect } from 'react';

export default function UserModal({ open, user, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        role: 'user'
    });

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || '',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                role: user.role || 'user'
            });
        }
    }, [user]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(user.id, formData);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <div className="modal__title">Редактирование пользователя</div>
                    <button className="iconBtn" onClick={onClose}>✕</button>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <label className="label">
                        Email
                        <input
                            className="input"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label className="label">
                        Имя
                        <input
                            className="input"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label className="label">
                        Фамилия
                        <input
                            className="input"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label className="label">
                        Роль
                        <select
                            className="input"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="user">Пользователь</option>
                            <option value="seller">Продавец</option>
                            <option value="admin">Администратор</option>
                        </select>
                    </label>

                    <div className="modal__footer">
                        <button type="button" className="btn btn--cancel" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="btn btn--primary">
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}