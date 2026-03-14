import React, { useState } from 'react';
import './style_sklad.css';

interface Activity {
  time: string;
  action: string;
  number: string;
  executor: string;
  status: string;
}

const activities: Activity[] = [];

const Dashboard: React.FC = () => {
  const [modalType, setModalType] = useState<'none' | 'priemka' | 'sborka' | 'otgruzka'>('none');

  const openModal = (type: 'priemka' | 'sborka' | 'otgruzka') => {
    console.log('Кнопка временно не работает');
  };

  const closeModal = () => {
    setModalType('none');
  };

  return (
    <div className="dashboard-wrapper">
      <header className="top-header">
        <span className="logo">prostor</span>
        <div className="manager">Manager</div>
        <div className="tabs">
          <span className="tab active">Приемка</span>
          <span className="tab">
            Сборка
          </span>
          <span className="tab">
            Отгрузка
          </span>
          <span className="user">И. И. Иванов</span>
        </div>
      </header>

      <main className="main-content">
        <h1 className="page-title">Панель управления складом</h1>

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
              onClick={() => openModal('priemka')}
              disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
              <span>Приемка товара</span>
            </button>

            <button 
              className="action-btn with-ring" 
              onClick={() => openModal('sborka')}
              disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
              <span>Заказы на сборку</span>
            </button>

            <button 
              className="action-btn" 
              onClick={() => openModal('otgruzka')}
              disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
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