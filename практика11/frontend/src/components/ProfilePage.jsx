import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function ProfilePage({ onLogout }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [token, setToken] = useState(localStorage.getItem('accessToken'));

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await api.getMe();
            setProfile(data);
            setError('');
        } catch (error) {
            setError('Ошибка загрузки профиля');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        onLogout();
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="profile-card">
                    <h2>Профиль</h2>
                    <div className="loading">Загрузка...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <div className="profile-card">
                    <h2>Профиль</h2>
                    <div className="error">{error}</div>
                    <button className="btn btn--primary btn--block" onClick={handleLogout}>
                        Выйти
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2>Профиль</h2>
                
                {profile && (
                    <div className="profile-info">
                        <div className="info-row">
                            <span className="info-label">Email:</span>
                            <span className="info-value">{profile.email}</span>
                        </div>
                        
                        <div className="info-row">
                            <span className="info-label">Имя:</span>
                            <span className="info-value">{profile.first_name}</span>
                        </div>
                        
                        <div className="info-row">
                            <span className="info-label">Фамилия:</span>
                            <span className="info-value">{profile.last_name}</span>
                        </div>
                        
                        <div className="info-row">
                            <span className="info-label">Роль:</span>
                            <span className={`info-value role-badge role-${profile.role}`}>
                                {profile.role === 'user' && 'Пользователь'}
                                {profile.role === 'seller' && 'Продавец'}
                                {profile.role === 'admin' && 'Администратор'}
                            </span>
                        </div>
                    </div>
                )}

                <div className="token-info">
                    <strong>Токен доступа:</strong>
                    <div className="token-value">
                        <small>{token}</small>
                    </div>
                </div>
            </div>
        </div>
    );
}