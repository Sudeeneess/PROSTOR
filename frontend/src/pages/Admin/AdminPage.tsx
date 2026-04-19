import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminPage.module.css';
import HeaderAdmin from './HeaderAdmin';
import UsersAdmin from './UsersAdmin';
import { readAdminActions, type AdminActionEntry } from './adminActionLog';
import { api } from '../../services/api';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<'admin' | 'users'>('admin');
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalAdmins, setTotalAdmins] = useState<number | null>(null);
  const [recentActions, setRecentActions] = useState<AdminActionEntry[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const stats = await api.getAdminDashboardStats();
      setTotalUsers(stats.totalUsers);
      setTotalAdmins(stats.totalAdmins);
    } catch (e) {
      setStatsError(e instanceof Error ? e.message : 'Не удалось загрузить сводку');
      setTotalUsers(null);
      setTotalAdmins(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (currentPage === 'admin') {
      setRecentActions(readAdminActions());
    }
  }, [currentPage]);

  const handleLogout = () => {
    api.logout();
    navigate('/');
  };

  const handleUsersClick = () => setCurrentPage('users');
  const handleBackToAdmin = () => setCurrentPage('admin');

  if (currentPage === 'users') {
    return <UsersAdmin onBack={handleBackToAdmin} />;
  }

  const formatMetric = (n: number | null) => {
    if (statsLoading) return '…';
    if (n == null) return '—';
    return n.toLocaleString('ru-RU');
  };

  return (
    <>
      <HeaderAdmin />
      <div className={styles['AdminPage-container']}>
        <div className={styles['AdminPage-metrics']}>
          <div
            className={`${styles['AdminPage-metric-card']} ${styles['AdminPage-metric-card-clickable']}`}
            onClick={handleUsersClick}
          >
            <span className={styles['AdminPage-metric-label']}>Пользователи</span>
            <span className={styles['AdminPage-metric-value']}>{formatMetric(totalUsers)}</span>
          </div>
          <div className={styles['AdminPage-metric-card']}>
            <span className={styles['AdminPage-metric-label']}>Учётных записей админов</span>
            <span className={styles['AdminPage-metric-value']}>{formatMetric(totalAdmins)}</span>
          </div>
        </div>

        {statsError && (
          <p className={styles['AdminPage-stats-error']} role="alert">
            {statsError}
          </p>
        )}

        <div className={styles['AdminPage-recent-actions']}>
          <h2 className={styles['AdminPage-section-title']}>Последние действия</h2>
          {recentActions.length === 0 ? (
            <p className={styles['AdminPage-audit-placeholder']}>
              Записей пока нет. Действия с пользователями сохраняются в этом браузере (localStorage).
            </p>
          ) : (
            <div className={styles['AdminPage-table-wrapper']}>
              <table className={styles['AdminPage-actions-table']}>
                <thead>
                  <tr>
                    <th>Время</th>
                    <th>Действие</th>
                    <th>Пользователь</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActions.map((row, index) => (
                    <tr key={`${row.time}-${index}`}>
                      <td>{row.time}</td>
                      <td>{row.action}</td>
                      <td>{row.userLabel}</td>
                      <td>
                        <span className={styles['AdminPage-status-success']}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <button type="button" className={styles['admin-logout-btn']} onClick={handleLogout}>
          Выйти из аккаунта
        </button>
      </div>
    </>
  );
};

export default AdminPage;
