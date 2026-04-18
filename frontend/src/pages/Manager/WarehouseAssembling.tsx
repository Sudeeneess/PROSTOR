import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './WarehouseAssembling.module.css';
import { api } from '../../services/api';
import type { OrderResponseDto } from '../../services/api';
import {
  assemblyStatusOptionLabel,
  orderStatusIdsByName,
} from '../../utils/warehouseOrderStatus';
import { warehouseOrderNumber } from '../../utils/warehouseOrderNumber';

interface WarehouseAssemblingProps {
  onBack: () => void;
}

const ASSEMBLY_STATUS_NAMES = ['PENDING', 'CONFIRMED', 'SHIPPED'] as const;

const WarehouseAssembling: React.FC<WarehouseAssemblingProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [statusByName, setStatusByName] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    const statusesRes = await api.getOrderStatuses(0, 100);
    if (!statusesRes.success || !statusesRes.data) {
      setError(statusesRes.error || 'Не удалось загрузить статусы заказов');
      return;
    }

    const idMap = orderStatusIdsByName(statusesRes.data.content);
    setStatusByName(idMap);

    const pendingId = idMap.get('PENDING');
    const confirmedId = idMap.get('CONFIRMED');
    if (pendingId == null || confirmedId == null) {
      setError('В справочнике нет статусов «на рассмотрении» или «собирается на складе»');
      return;
    }

    const [pendingRes, confirmedRes] = await Promise.all([
      api.getOrdersByStatus(pendingId, 0, 100),
      api.getOrdersByStatus(confirmedId, 0, 100),
    ]);

    const list: OrderResponseDto[] = [];
    if (pendingRes.success && pendingRes.data) {
      list.push(...pendingRes.data.content);
    }
    if (confirmedRes.success && confirmedRes.data) {
      list.push(...confirmedRes.data.content);
    }

    if (!pendingRes.success || !pendingRes.data) {
      setError(pendingRes.error || 'Не удалось загрузить заказы на рассмотрении');
      return;
    }
    if (!confirmedRes.success || !confirmedRes.data) {
      setError(confirmedRes.error || 'Не удалось загрузить заказы в сборке');
      return;
    }

    list.sort((a, b) => {
      const ta = a.orderDate ? new Date(a.orderDate).getTime() : 0;
      const tb = b.orderDate ? new Date(b.orderDate).getTime() : 0;
      return tb - ta;
    });

    setOrders(list);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = sessionStorage.getItem('userRole');
    if (!token || role !== 'warehouse_manager') {
      navigate('/warehouse/auth', { replace: true });
      return;
    }

    const run = async () => {
      setIsLoading(true);
      setError(null);
      await loadOrders();
      setIsLoading(false);
    };
    void run();
  }, [navigate, loadOrders]);

  const formatDate = (value?: string) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const itemsLabel = (count: number) =>
    `${count} ${count === 1 ? 'позиция' : count < 5 ? 'позиции' : 'позиций'}`;

  const handleStatusChange = async (order: OrderResponseDto, nextName: string) => {
    const current = order.status.name.toUpperCase();
    const next = nextName.toUpperCase();
    if (current === next) return;

    setRowError(null);
    setUpdatingOrderId(order.id);

    try {
      if (current === 'PENDING' && next === 'CONFIRMED') {
        const res = await api.confirmOrder(order.id);
        if (!res.success) {
          throw new Error(res.error || 'Не удалось подтвердить заказ');
        }
      } else if (current === 'CONFIRMED' && next === 'SHIPPED') {
        const shippedId = statusByName.get('SHIPPED');
        if (shippedId == null) {
          throw new Error('Статус «отправлено на отгрузку» не найден в справочнике');
        }
        const res = await api.setOrderStatus(order.id, shippedId);
        if (!res.success) {
          throw new Error(res.error || 'Не удалось отправить заказ на отгрузку');
        }
      } else {
        throw new Error(
          'Недопустимый переход статуса: допустимо подтвердить заказ из «на рассмотрении» или отправить на отгрузку из «собирается на складе»'
        );
      }

      await loadOrders();
    } catch (e) {
      setRowError(e instanceof Error ? e.message : 'Ошибка сохранения статуса');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <div className={styles['warehouse-assembling-main-content']}>
        <div className={styles['warehouse-assembling-content-header']}>
          <h1 className={styles['warehouse-assembling-page-title']}>Сборка</h1>
          <button type="button" className={styles['warehouse-assembling-back-button']} onClick={onBack}>
            Назад
          </button>
        </div>
        <div className={styles['warehouse-assembling-orders-table-container']}>Загрузка…</div>
      </div>
    );
  }

  return (
    <div className={styles['warehouse-assembling-main-content']}>
      <div className={styles['warehouse-assembling-content-header']}>
        <h1 className={styles['warehouse-assembling-page-title']}>Сборка</h1>
        <button type="button" className={styles['warehouse-assembling-back-button']} onClick={onBack}>
          Назад
        </button>
      </div>

      {(error || rowError) && (
        <div className={styles['warehouse-assembling-alert']} role="alert">
          {error && <div>{error}</div>}
          {rowError && <div>{rowError}</div>}
        </div>
      )}

      <div className={styles['warehouse-assembling-orders-table-container']}>
        <table className={styles['warehouse-assembling-orders-table']}>
          <thead>
            <tr>
              <th className={styles['warehouse-assembling-col-order']}>Номер заказа</th>
              <th className={styles['warehouse-assembling-col-items']}>Состав</th>
              <th className={styles['warehouse-assembling-col-date']}>Дата</th>
              <th className={styles['warehouse-assembling-col-status']}>Статус</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles['warehouse-assembling-empty-row']}>
                  Нет заказов на рассмотрении и в сборке
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const current = order.status.name.toUpperCase();
                const busy = updatingOrderId === order.id;
                return (
                  <tr key={order.id}>
                    <td className={styles['warehouse-assembling-col-order']}>
                      {warehouseOrderNumber(order.id)}
                    </td>
                    <td className={styles['warehouse-assembling-col-items']}>
                      {itemsLabel(order.items.length)}
                    </td>
                    <td className={styles['warehouse-assembling-col-date']}>{formatDate(order.orderDate)}</td>
                    <td className={styles['warehouse-assembling-col-status']}>
                      <select
                        className={styles['warehouse-assembling-status-select']}
                        value={current}
                        disabled={busy}
                        onChange={(e) => void handleStatusChange(order, e.target.value)}
                        aria-label={`Статус заказа ${warehouseOrderNumber(order.id)}`}
                      >
                        {ASSEMBLY_STATUS_NAMES.map((code) => {
                          const disabled =
                            (code === 'PENDING' && current === 'CONFIRMED') ||
                            (code === 'SHIPPED' && current === 'PENDING') ||
                            (code === 'PENDING' && current === 'SHIPPED');
                          return (
                            <option key={code} value={code} disabled={disabled}>
                              {assemblyStatusOptionLabel(code)}
                            </option>
                          );
                        })}
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WarehouseAssembling;
