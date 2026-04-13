import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import HeaderManager from './HeaderManager';
import styles from './WarehousePage.module.css';
import WarehouseReceiving from './WarehouseReceiving';
import WarehouseAssembling from './WarehouseAssembling';
import WarehouseShipment from './WarehouseShipment';

interface Activity {
  id: string;
  time: string;
  action: string;
  number: string;
  executor: string;
  status: 'success' | 'pending' | 'warning' | 'error';
}

// Инициализация с примерами данных в формате #S-XX
const initialActivities: Activity[] = [
  {
    id: '1',
    time: '14:30',
    action: 'Приемка товара',
    number: '#S-45',
    executor: 'Алексей С.',
    status: 'success'
  },
  {
    id: '2',
    time: '14:15',
    action: 'Сборка заказа',
    number: '#S-46',
    executor: 'Мария К.',
    status: 'pending'
  },
  {
    id: '3',
    time: '13:50',
    action: 'Отгрузка товара',
    number: '#S-47',
    executor: 'Дмитрий В.',
    status: 'success'
  },
  {
    id: '4',
    time: '13:20',
    action: 'Приемка товара',
    number: '#S-44',
    executor: 'Алексей С.',
    status: 'success'
  },
  {
    id: '5',
    time: '12:45',
    action: 'Сборка заказа',
    number: '#S-43',
    executor: 'Мария К.',
    status: 'warning'
  },
  {
    id: '6',
    time: '12:10',
    action: 'Проверка качества',
    number: '#S-42',
    executor: 'Игорь Н.',
    status: 'success'
  },
  {
    id: '7',
    time: '11:35',
    action: 'Отгрузка товара',
    number: '#S-41',
    executor: 'Дмитрий В.',
    status: 'success'
  },
  {
    id: '8',
    time: '11:00',
    action: 'Приемка товара',
    number: '#S-40',
    executor: 'Алексей С.',
    status: 'pending'
  }
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('Алексей С.');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [nextOrderNumber, setNextOrderNumber] = useState<number>(48);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = sessionStorage.getItem('userRole');
    
    if (!token || role !== 'warehouse_manager') {
      navigate('/warehouse/auth', { replace: true });
      return;
    }
    
    const storedUserName = sessionStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, [navigate]);

  const generateOrderNumber = (): string => {
    const newNumber = nextOrderNumber;
    setNextOrderNumber(prev => prev + 1);
    return `#S-${newNumber}`;
  };

  const addActivity = (newActivity: Omit<Activity, 'id' | 'time' | 'number'> & { number?: string }) => {
    const activity: Activity = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      number: newActivity.number || generateOrderNumber(),
      ...newActivity
    };
    setActivities(prev => [activity, ...prev.slice(0, 14)]);
  };

  const getStatusClass = (status: Activity['status']) => {
    switch(status) {
      case 'success':
        return 'status-success';
      case 'pending':
        return 'status-pending';
      case 'warning':
        return 'status-warning';
      case 'error':
        return 'status-error';
      default:
        return '';
    }
  };

  const getStatusText = (status: Activity['status']) => {
    switch(status) {
      case 'success':
        return 'Выполнено';
      case 'pending':
        return 'В процессе';
      case 'warning':
        return 'Требует внимания';
      case 'error':
        return 'Ошибка';
      default:
        return status;
    }
  };

  // Обработчики для меню
  const handleMenuItemChange = (menuItem: string) => {
    setActiveTab(menuItem);
    // Добавляем активность при смене меню
    if (menuItem !== 'dashboard') {
      addActivity({
        action: `Переход в раздел ${getMenuTitle(menuItem)}`,
        executor: userName,
        status: 'pending'
      });
    }
  };

  const getMenuTitle = (menuItem: string): string => {
    switch(menuItem) {
      case 'receiving':
        return 'Приемка';
      case 'assembling':
        return 'Сборка';
      case 'shipment':
        return 'Отгрузка';
      default:
        return 'Управление';
    }
  };

  const handleManagementClick = () => {
    setActiveTab('dashboard');
  };

  const openReceiving = () => {
    setActiveTab('receiving');
    addActivity({
      action: 'Открыта форма приемки',
      executor: userName,
      status: 'pending'
    });
  };

  const openAssembling = () => {
    setActiveTab('assembling');
    addActivity({
      action: 'Открыта форма сборки',
      executor: userName,
      status: 'pending'
    });
  };

  const openShipment = () => {
    setActiveTab('shipment');
    addActivity({
      action: 'Открыта форма отгрузки',
      executor: userName,
      status: 'pending'
    });
  };

  const handleBackToDashboard = () => {
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    addActivity({
      action: 'Выход из системы',
      executor: userName,
      status: 'success'
    });
    
    localStorage.removeItem('token');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userRole');
    navigate('/', { replace: true });
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'receiving':
        return <WarehouseReceiving onBack={handleBackToDashboard} />;
      case 'assembling':
        return <WarehouseAssembling onBack={handleBackToDashboard} />;
      case 'shipment':
        return <WarehouseShipment onBack={handleBackToDashboard} />;
      default:
        return (
          <>
            <div className={styles['content-header']}>
              <h1 className={styles['page-title']}>Панель управления складом</h1>
              <div className={styles['user-info']}>
                <span className={styles['user-name']}>{userName}</span>
                <button 
                  className={styles['logout-button']}
                  onClick={handleLogout}
                >
                  Выйти
                </button>
              </div>
            </div>

            <section className={styles['stats-cards']}>
              <div className={styles['card']}>
                <div className={styles['card-title']}>Заказов к сборке сегодня</div>
                <div className={styles['card-value']}>
                  {activities.filter(a => a.action === 'Сборка заказа' && a.status === 'pending').length}
                </div>
              </div>
              <div className={styles['card']}>
                <div className={styles['card-title']}>Поставок на приемке</div>
                <div className={styles['card-value']}>
                  {activities.filter(a => a.action === 'Приемка товара' && a.status === 'pending').length}
                </div>
              </div>
              <div className={styles['card']}>
                <div className={styles['card-title']}>Заказов готово к отгрузке</div>
                <div className={styles['card-value']}>
                  {activities.filter(a => a.action === 'Отгрузка товара' && a.status === 'success').length}
                </div>
              </div>
            </section>

            <section className={styles['quick-actions']}>
              <h2 className={styles['section-title']}>Быстрые действия</h2>
              <div className={styles['action-buttons']}>
                <button 
                  className={styles['action-btn']} 
                  onClick={openReceiving}
                >
                  <span>Приемка товара</span>
                </button>

                <button 
                  className={`${styles['action-btn']} ${styles['with-ring']}`} 
                  onClick={openAssembling}
                >
                  <span>Заказы на сборку</span>
                </button>
                <button 
                  className={styles['action-btn']} 
                  onClick={openShipment}
                >
                  <span>Готово к отгрузке</span>
                </button>
              </div>
            </section>
            
            <section className={styles['recent-activity']}>
              <h2 className={styles['section-title']}>Последние активности</h2>
              <div className={styles['activity-table']}>
                <div className={styles['table-header']}>
                  <div className={`${styles['col']} ${styles['time']}`}>Время</div>
                  <div className={`${styles['col']} ${styles['action']}`}>Действие</div>
                  <div className={`${styles['col']} ${styles['number']}`}>Номер заказа/Поставки</div>
                  <div className={`${styles['col']} ${styles['executor']}`}>Исполнитель</div>
                  <div className={`${styles['col']} ${styles['status']}`}>Статус</div>
                </div>
                {activities.length === 0 ? (
                  <div className={styles['empty-table']}>
                    <div className={`${styles['table-row']} ${styles['empty']}`}>
                      <div className={styles['col']} style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                        Нет активностей
                      </div>
                    </div>
                  </div>
                ) : (
                  activities.map((item) => (
                    <div key={item.id} className={styles['table-row']}>
                      <div className={`${styles['col']} ${styles['time']}`}>{item.time}</div>
                      <div className={`${styles['col']} ${styles['action']}`}>{item.action}</div>
                      <div className={`${styles['col']} ${styles['number']}`}>{item.number}</div>
                      <div className={`${styles['col']} ${styles['executor']}`}>{item.executor}</div>
                      <div className={`${styles['col']} ${styles['status']}`}>
                        <span
                          className={
                            getStatusClass(item.status)
                              ? `${styles['status-badge']} ${styles[getStatusClass(item.status) as 'status-success' | 'status-pending' | 'status-warning' | 'status-error']}`
                              : styles['status-badge']
                          }
                        >
                          {getStatusText(item.status)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className={styles['dashboard-wrapper']}>
      <HeaderManager 
        onMenuItemChange={handleMenuItemChange}
        onManagementClick={handleManagementClick}
      />
      <main className={styles['main-content']}>
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;