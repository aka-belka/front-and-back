import React, { useState, useEffect } from 'react';
import { api } from './api';
import Login from './components/Login';
import Register from './components/Register';
import ProductsPage from './components/ProductsPage';
import UsersPage from './components/UsersPage';
import ProfilePage from './components/ProfilePage';
import './App.css';

function App() {
    const [currentPage, setCurrentPage] = useState('login');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            checkAuth();
        }
    }, []);

    const checkAuth = async () => {
        try {
            const userData = await api.getMe();
            setUser(userData);
            setIsAuthenticated(true);
            setCurrentPage('products');
        } catch {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    };

    const handleLogin = () => {
        checkAuth();
    };

    const handleRegister = () => {
        checkAuth();
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        setUser(null);
        setCurrentPage('login');
    };

    const handleNavigate = (page) => {
        setCurrentPage(page);
    };

    const renderPage = () => {
        if (!isAuthenticated) {
            if (currentPage === 'register') {
                return <Register onRegister={handleRegister} onNavigate={handleNavigate} />;
            }
            return <Login onLogin={handleLogin} onNavigate={handleNavigate} />;
        }

        if (currentPage === 'profile') {
            return <ProfilePage onLogout={handleLogout} />;
        }

        if (currentPage === 'users' && user?.role === 'admin') {
            return <UsersPage currentUser={user} />;
        }

        return <ProductsPage />;
    };

    return (
        <div className="app">
            <nav className="navbar">
                <div className="navbar-brand">
                    <span>Магазин</span>
                </div>
                <div className="navbar-menu">
                    {isAuthenticated ? (
                        <>
                            <button 
                                onClick={() => handleNavigate('products')}
                                className={`nav-link ${currentPage === 'products' ? 'active' : ''}`}
                            >
                                Товары
                            </button>
                            
                            {user?.role === 'admin' && (
                                <button 
                                    onClick={() => handleNavigate('users')}
                                    className={`nav-link ${currentPage === 'users' ? 'active' : ''}`}
                                >
                                    Пользователи
                                </button>
                            )}
                            <button 
                                onClick={() => handleNavigate('profile')}
                                className={`nav-link ${currentPage === 'profile' ? 'active' : ''}`}
                            >
                                 {user?.first_name} {user?.last_name} ({user?.role})
                            </button>
                            <button className="btn btn--logout" onClick={handleLogout}>
                                Выйти
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={() => handleNavigate('login')}
                                className={`nav-link ${currentPage === 'login' ? 'active' : ''}`}
                            >
                                Вход
                            </button>
                            <button 
                                onClick={() => handleNavigate('register')}
                                className={`nav-link ${currentPage === 'register' ? 'active' : ''}`}
                            >
                                Регистрация
                            </button>
                        </>
                    )}
                </div>
            </nav>

            <main className="main">
                {renderPage()}
            </main>
        </div>
    );
}

export default App;