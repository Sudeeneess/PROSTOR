import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';
import HeaderAdmin from './HeaderAdmin';
import UsersAdmin from './UsersAdmin'; // Импортируем компонент

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<'admin' | 'users'>('admin');
  
  // Static data for the table
  const recentActions = [
    { time: '14:30', action: 'Заблокирован пользователь', user: 'Петров П.', status: 'Выполнено' },
    { time: '14:30', action: 'Скрыт товар "Куртка"', user: 'Система', status: 'Выполнено' },
    { time: '14:30', action: 'Изменен товар "Штаны"', user: 'Система', status: 'Выполнено' },
  ];

  const handleUsersClick = () => {
    setCurrentPage('users'); // Переключаем на страницу пользователей
  };

  const handleProductsClick = () => {
    navigate('/products'); // Навигация на страницу товаров
  };

  const handleBackToAdmin = () => {
    setCurrentPage('admin'); // Возврат на админ-панель
  };

  // Если мы на странице пользователей - показываем UsersAdmin
  if (currentPage === 'users') {
    return <UsersAdmin onBack={handleBackToAdmin} />;
  }

  // Иначе показываем админ-панель
  return (
    <>
      <HeaderAdmin />
      <div className="AdminPage-container">
        {/* Metrics Section */}
        <div className="AdminPage-metrics">
          <div 
            className="AdminPage-metric-card AdminPage-metric-card-clickable" 
            onClick={handleUsersClick}
          >
            <span className="AdminPage-metric-label">Пользователи</span>
            <span className="AdminPage-metric-value">1254</span>
          </div>
          <div 
            className="AdminPage-metric-card AdminPage-metric-card-clickable" 
            onClick={handleProductsClick}
          >
            <span className="AdminPage-metric-label">Товары</span>
            <span className="AdminPage-metric-value">8547</span>
          </div>
        </div>

        
        <div className="AdminPage-recent-actions">
          <h2 className="AdminPage-section-title">Последние действия</h2>
          <div className="AdminPage-table-wrapper">
            <table className="AdminPage-actions-table">
              <thead>
                <tr>
                  <th>Время</th>
                  <th>Действие</th>
                  <th>Пользователь</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {recentActions.map((action, index) => (
                  <tr key={index}>
                    <td>{action.time}</td>
                    <td>{action.action}</td>
                    <td>{action.user}</td>
                    <td><span className="AdminPage-status-success">{action.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPage;