import React, { useState } from 'react';
import { api } from '../api';

export default function Register({ onRegister, onNavigate }) {
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        try {
            const { confirmPassword, ...userData } = formData;
            console.log('Регистрация:', userData);
            await api.register(userData);
            
            console.log('Логин после регистрации:', { 
                email: formData.email, 
                password: formData.password 
            });
            
            const loginData = await api.login({ 
                email: formData.email, 
                password: formData.password 
            });
            
            localStorage.setItem('accessToken', loginData.accessToken);
            localStorage.setItem('refreshToken', loginData.refreshToken);
            onRegister();
        } catch (error) {
            console.error('Ошибка:', error.response || error);
            setError(error.response?.data?.error || 'Ошибка регистрации');
        }
    };

    return (
        <div className="auth-container">
            <h2>Регистрация</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Имя:</label>
                    <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Фамилия:</label>
                    <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Пароль:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Подтверждение пароля:</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn--primary btn--block">
                    Зарегистрироваться
                </button>
            </form>
            <p className="auth-link">
                Уже есть аккаунт?{' '}
                <button 
                    onClick={() => onNavigate('login')}
                    className="link-button"
                >
                    Войти
                </button>
            </p>
        </div>
    );
}