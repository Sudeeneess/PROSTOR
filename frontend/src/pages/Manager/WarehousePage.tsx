import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderManager from './HeaderManager';
import './WarehousePage.css';

interface Activity {
  time: string;
  action: string;
  number: string;
  executor: string;
  status: string;
}

const activities: Activity[] = [];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('И. И. Иванов');

  useEffect(() => {
    // Проверяем авторизацию
    const token = localStorage.getItem('token');
    const role = sessionStorage.getItem('userRole');
    
    if (!token || role !== 'warehouse_manager') {
      // Если не авторизован, перенаправляем на страницу авторизации
      navigate('/auth/warehouse', { replace: true });
      return;
    }
    
    // Загружаем имя пользователя из sessionStorage
    const storedUserName = sessionStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, [navigate]);

  const openPriemka = () => {
    navigate('/priemka');
  };

  const openSborka = () => {
    navigate('/sborka');
  };

  const handleLogout = () => {
    // Очищаем данные авторизации
    localStorage.removeItem('token');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userRole');
    
    // Перенаправляем на страницу авторизации менеджера
    navigate('/auth/warehouse', { replace: true });
  };

  const handleTabClick = (tab: 'priemka' | 'sborka' | 'otgruzka') => {
    console.log('Клик по вкладке:', tab);
    if (tab !== 'priemka') {
      alert('Раздел временно недоступен');
    }
  };

  return (
    <div className="dashboard-wrapper">
      <HeaderManager />

      <main className="main-content">
        <div className="content-header">
          <h1 className="page-title">Панель управления складом</h1>
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <button 
              className="logout-button"
              onClick={handleLogout}
            >
              Выйти
            </button>
          </div>
        </div>

        <section className="stats-cards">
          <div className="card">
            <div className="card-title">Заказов к сборке сегодня</div>
            <div className="card-value">0</div>
          </div>
          <div className="card">
            <div className="card-title">Поставок на приемке</div>
            <div className="card-value">0</div>
          </div>
          <div className="card">
            <div className="card-title">Заказов готово к отгрузке</div>
            <div className="card-value">0</div>
          </div>
        </section>

        <section className="quick-actions">
          <h2 className="section-title">Быстрые действия</h2>
          <div className="action-buttons">
            <button 
              className="action-btn" 
              onClick={openPriemka}
            >
              <span>Приемка товара</span>
            </button>

            <button 
              className="action-btn with-ring" 
              onClick={openSborka}
            >
              <span>Заказы на сборку</span>
            </button>
            <button 
              className="action-btn" 
              onClick={() => navigate('/otgruzka')}>
                <span>Готово к отгрузке</span>
            </button>
          </div>
        </section>
        
        <section className="recent-activity">
          <h2 className="section-title">Последние активности</h2>
          <div className="activity-table">
            <div className="table-header">
              <div className="col time">Время</div>
              <div className="col action">Действие</div>
              <div className="col number">Номер заказа/Поставки</div>
              <div className="col executor">Исполнитель</div>
              <div className="col status">Статус</div>
            </div>
            {activities.length === 0 ? (
              <div className="empty-table">
                {Array(5).fill(null).map((_, i) => (
                  <div key={i} className="table-row empty">
                    <div className="col"></div>
                    <div className="col"></div>
                    <div className="col"></div>
                    <div className="col"></div>
                    <div className="col"></div>
                  </div>
                ))}
              </div>
            ) : (
              activities.map((item, idx) => (
                <div key={idx} className="table-row">
                  <div className="col time">{item.time}</div>
                  <div className="col action">{item.action}</div>
                  <div className="col number">{item.number}</div>
                  <div className="col executor">{item.executor}</div>
                  <div className="col status">{item.status}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;