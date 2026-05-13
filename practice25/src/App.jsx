import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));

function App() {
    return (
        <BrowserRouter>
            <div>
                <nav style={{ padding: '20px', backgroundColor: '#f0f0f0', marginBottom: '20px' }}>
                    <Link to="/" style={{ marginRight: '20px' }}>Главная</Link>
                    <Link to="/about">О нас</Link>
                </nav>
                <Suspense fallback={<div>Загрузка страницы...</div>}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                    </Routes>
                </Suspense>
            </div>
        </BrowserRouter>
    );
}

export default App;