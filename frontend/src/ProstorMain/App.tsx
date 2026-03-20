import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './Header';
import ProductGrid from './ProductGrid';
import AuthPage from '../Buyer/AuthPage'; 
import MainPageBuyer from '../Buyer/MainPageBuyer';
import ManagerMainPage from '../Manager/manager_mainpage';
import Sklad from '../Manager/sklad';

// Создадим компонент-обертку для обработки навигации
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Проверяем, что кликнули по кнопке менеджера склада
      if (target.tagName === 'BUTTON' && 
          target.textContent?.includes('менеджер склада')) {
        e.preventDefault();
        e.stopPropagation();
        navigate('/warehouse');
      }
    };

    // Добавляем глобальный обработчик
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [navigate]);

  return (
    <Routes>
      {/* Главная страница */}
      <Route path="/" element={
        <>
          <Header />
          <main className="main-content">
            <ProductGrid />
          </main>
        </>
      } />
      
      {/* Страница авторизации */}
      <Route path="/auth" element={<AuthPage />} />
      
      <Route path="/buyer" element={<MainPageBuyer />} />
      {/* Другие страницы */}
      <Route path="/sklad" element={<Sklad />} />
      <Route path="/seller" element={<SellerPage />} />
      <Route path="/warehouse" element={<ManagerMainPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
};

// Создадим заглушки
const SellerPage: React.FC = () => (
  <div>
    <Header />
    <h1>Страница продавца</h1>
  </div>
);

const AdminPage: React.FC = () => (
  <div>
    <Header />
    <h1>Страница администратора</h1>
  </div>
);

function App() {
  return (
    <Router>
      <div className="app">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;