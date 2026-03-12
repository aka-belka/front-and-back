import React, { useState } from 'react';
import { api } from '../api';

export default function Login({ onLogin, onNavigate }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const data = await api.login({ email, password });
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            onLogin();
        } catch (error) {
            setError(error.response?.data?.error || 'Ошибка входа');
        }
    };

    return (
        <div className="auth-container">
            <h2>Вход</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Пароль:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn--primary btn--block">
                    Войти
                </button>
            </form>
            <p className="auth-link">
                Нет аккаунта?{' '}
                <button 
                    onClick={() => onNavigate('register')}
                    className="link-button"
                >
                    Зарегистрироваться
                </button>
            </p>
        </div>
    );
}