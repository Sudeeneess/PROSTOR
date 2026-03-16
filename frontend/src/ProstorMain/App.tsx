import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import ProductGrid from './ProductGrid';
import AuthPage from '../Buyer/AuthPage'; 
import MainPageBuyer from '../Buyer/MainPageBuyer';

// Создадим простые заглушки для других страниц
const SellerPage: React.FC = () => (
  <div>
    <Header />
    <h1>Страница продавца</h1>
  </div>
);

const WarehousePage: React.FC = () => (
  <div>
    <Header />
    <h1>Страница менеджера склада</h1>
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
          
          {
          <Route path="/buyer" element={<MainPageBuyer />} />
          }
          
          {/* Другие страницы */}
          <Route path="/seller" element={<SellerPage />} />
          <Route path="/warehouse" element={<WarehousePage />} />
          <Route path="/admin" element={<AdminPage />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;