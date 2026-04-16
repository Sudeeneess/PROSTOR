import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderManager from './HeaderManager';
import styles from './WarehousePage.module.css';
import WarehouseReceiving from './WarehouseReceiving';
import WarehouseAssembling from './WarehouseAssembling';
import WarehouseShipment from './WarehouseShipment';
import { api } from '../../services/api';
import type { OrderResponseDto, OrderStatusDto } from '../../services/api';

interface Activity {
  id: string;
  time: string;
  action: string;
  number: string;
  executor: string;
  status: 'success' | 'pending' | 'warning' | 'error';
}

interface DashboardStats {
  pendingCount: number;
  confirmedCount: number;
  shippedCount: number;
}

const EMPTY_STATS: DashboardStats = {
  pendingCount: 0,
  confirmedCount: 0,
  shippedCount: 0,
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>(() => sessionStorage.getItem('userName') || 'Менеджер');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

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

    const loadDashboardData = async () => {
      setIsLoadingDashboard(true);
      setDashboardError(null);

      const statusesResponse = await api.getOrderStatuses(0, 100);
      const ordersResponse = await api.getOrders(0, 100);

      if (!statusesResponse.success || !statusesResponse.data) {
        setDashboardError(statusesResponse.error || 'Не удалось загрузить статусы заказов');
        setIsLoadingDashboard(false);
        return;
      }

      if (!ordersResponse.success || !ordersResponse.data) {
        setDashboardError(ordersResponse.error || 'Не удалось загрузить список заказов');
        setIsLoadingDashboard(false);
        return;
      }

      const statuses = statusesResponse.data.content;
      const orders = ordersResponse.data.content;
      const statusIds = getStatusIds(statuses);

      setStats({
        pendingCount: countOrdersByStatus(orders, statusIds.PENDING),
        confirmedCount: countOrdersByStatus(orders, statusIds.CONFIRMED),
        shippedCount: countOrdersByStatus(orders, statusIds.SHIPPED),
      });

      const executor = sessionStorage.getItem('userName')?.trim() || 'Менеджер';
      setActivities(buildActivitiesFromOrders(orders, executor));
      setIsLoadingDashboard(false);
    };

    void loadDashboardData();
  }, [navigate]);

  const getStatusIds = (statuses: OrderStatusDto[]): Record<string, number | null> => {
    const byName = new Map(statuses.map((s) => [s.name.toUpperCase(), s.id]));
    return {
      PENDING: byName.get('PENDING') ?? null,
      CONFIRMED: byName.get('CONFIRMED') ?? null,
      SHIPPED: byName.get('SHIPPED') ?? null,
      IN_TRANSIT: byName.get('IN_TRANSIT') ?? null,
      DELIVERED: byName.get('DELIVERED') ?? null,
      ISSUED: byName.get('ISSUED') ?? null,
      CANCELLED: byName.get('CANCELLED') ?? null,
    };
  };

  const countOrdersByStatus = (orders: OrderResponseDto[], statusId: number | null): number => {
    if (!statusId) return 0;
    return orders.filter((o) => o.status.id === statusId).length;
  };

  const buildActivitiesFromOrders = (orders: OrderResponseDto[], executor: string): Activity[] => {
    const sorted = [...orders].sort((a, b) => {
      const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
      const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
      return dateB - dateA;
    });

    return sorted.slice(0, 15).map((order, index) => {
      const mapped = mapStatusToActivity(order.status.name);
      return {
        id: `order-${order.id}-${index}`,
        time: order.orderDate
          ? new Date(order.orderDate).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '--:--',
        action: mapped.action,
        number: `#S-${order.id}`,
        executor,
        status: mapped.status,
      };
    });
  };

  const mapStatusToActivity = (
    statusName: string
  ): { action: string; status: Activity['status'] } => {
    const n = statusName.toUpperCase();
    switch (n) {
      case 'PENDING':
        return { action: 'Заказ ожидает сборки', status: 'pending' };
      case 'CONFIRMED':
        return { action: 'Заказ собирается на складе', status: 'pending' };
      case 'SHIPPED':
        return { action: 'Заказ отправлен на отгрузку', status: 'pending' };
      case 'IN_TRANSIT':
        return { action: 'Заказ в пути', status: 'pending' };
      case 'DELIVERED':
        return { action: 'Заказ готов к выдаче', status: 'success' };
      case 'ISSUED':
        return { action: 'Заказ выдан', status: 'success' };
      case 'CANCELLED':
        return { action: 'Заказ отменён', status: 'warning' };
      default:
        return { action: `Статус ${statusName}`, status: 'pending' };
    }
  };

  const getStatusClass = (status: Activity['status']) => {
    switch (status) {
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
    switch (status) {
      case 'success':
        return 'Готово';
      case 'pending':
        return 'В работе';
      case 'warning':
        return 'Отмена';
      case 'error':
        return 'Ошибка';
      default:
        return status;
    }
  };

  const handleMenuItemChange = (menuItem: string) => {
    setActiveTab(menuItem);
  };

  const handleManagementClick = () => {
    setActiveTab('dashboard');
  };

  const openReceiving = () => setActiveTab('receiving');
  const openAssembling = () => setActiveTab('assembling');
  const openShipment = () => setActiveTab('shipment');

  const handleBackToDashboard = () => {
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    api.logout();
    navigate('/', { replace: true });
  };

  const renderContent = () => {
    switch (activeTab) {
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
                <button type="button" className={styles['logout-button']} onClick={handleLogout}>
                  Выйти
                </button>
              </div>
            </div>

            <section className={styles['stats-cards']}>
              <div className={styles['card']}>
                <div className={styles['card-title']}>Ожидают сборки (PENDING)</div>
                <div className={styles['card-value']}>{stats.pendingCount}</div>
              </div>
              <div className={styles['card']}>
                <div className={styles['card-title']}>Собираются (CONFIRMED)</div>
                <div className={styles['card-value']}>{stats.confirmedCount}</div>
              </div>
              <div className={styles['card']}>
                <div className={styles['card-title']}>На отгрузке (SHIPPED)</div>
                <div className={styles['card-value']}>{stats.shippedCount}</div>
              </div>
            </section>

            <section className={styles['quick-actions']}>
              <h2 className={styles['section-title']}>Быстрые действия</h2>
              <div className={styles['action-buttons']}>
                <button type="button" className={styles['action-btn']} onClick={openReceiving}>
                  <span>Приемка товара</span>
                </button>
                <button
                  type="button"
                  className={`${styles['action-btn']} ${styles['with-ring']}`}
                  onClick={openAssembling}
                >
                  <span>Сборка</span>
                </button>
                <button type="button" className={styles['action-btn']} onClick={openShipment}>
                  <span>Отгрузка</span>
                </button>
              </div>
            </section>

            <section className={styles['recent-activity']}>
              <h2 className={styles['section-title']}>Последние заказы</h2>
              {dashboardError && (
                <div className={styles['empty-table']}>
                  <div className={`${styles['table-row']} ${styles['empty']}`}>
                    <div className={styles['col']} style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                      {dashboardError}
                    </div>
                  </div>
                </div>
              )}
              <div className={styles['activity-table']}>
                <div className={styles['table-header']}>
                  <div className={`${styles['col']} ${styles['time']}`}>Время</div>
                  <div className={`${styles['col']} ${styles['action']}`}>Событие</div>
                  <div className={`${styles['col']} ${styles['number']}`}>Заказ</div>
                  <div className={`${styles['col']} ${styles['executor']}`}>Менеджер</div>
                  <div className={`${styles['col']} ${styles['status']}`}>Этап</div>
                </div>
                {isLoadingDashboard ? (
                  <div className={styles['empty-table']}>
                    <div className={`${styles['table-row']} ${styles['empty']}`}>
                      <div className={styles['col']} style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                        Загрузка…
                      </div>
                    </div>
                  </div>
                ) : activities.length === 0 ? (
                  <div className={styles['empty-table']}>
                    <div className={`${styles['table-row']} ${styles['empty']}`}>
                      <div className={styles['col']} style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                        Нет заказов
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
      <HeaderManager onMenuItemChange={handleMenuItemChange} onManagementClick={handleManagementClick} />
      <main className={styles['main-content']}>{renderContent()}</main>
    </div>
  );
};

export default Dashboard;
