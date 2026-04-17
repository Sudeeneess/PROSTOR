import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './WarehouseShipment.module.css';
import { api } from '../../services/api';
import type { OrderResponseDto } from '../../services/api';
import { orderStatusIdsByName, shipmentStatusOptionLabel } from '../../utils/warehouseOrderStatus';
import { warehouseOrderNumber } from '../../utils/warehouseOrderNumber';

interface WarehouseShipmentProps {
  onBack: () => void;
}

/** Заказы на вкладке «Отгрузка»: после отправки со сборки до выдачи */
const SHIPMENT_PIPELINE = ['SHIPPED', 'IN_TRANSIT', 'DELIVERED'] as const;

const WarehouseShipment: React.FC<WarehouseShipmentProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [statusByName, setStatusByName] = useState<Map<string, number>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    const ordersRes = await api.getOrders(0, 200);
    if (!ordersRes.success || !ordersRes.data) {
      setError(ordersRes.error || 'Не удалось загрузить заказы');
      return;
    }

    const allowed = new Set<string>(SHIPMENT_PIPELINE);
    const list = ordersRes.data.content.filter((o) =>
      allowed.has((o.status?.name ?? '').toUpperCase())
    );
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

      const statusesRes = await api.getOrderStatuses(0, 100);
      if (!statusesRes.success || !statusesRes.data) {
        setError(statusesRes.error || 'Не удалось загрузить статусы');
        setIsLoading(false);
        return;
      }
      setStatusByName(orderStatusIdsByName(statusesRes.data.content));

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

  const optionsForRow = (current: string): readonly string[] => {
    switch (current) {
      case 'SHIPPED':
        return ['SHIPPED', 'IN_TRANSIT'] as const;
      case 'IN_TRANSIT':
        return ['IN_TRANSIT', 'DELIVERED'] as const;
      case 'DELIVERED':
        return ['DELIVERED', 'ISSUED'] as const;
      default:
        return [current];
    }
  };

  const optionDisabled = (current: string, code: string): boolean => {
    if (current === 'SHIPPED' && code === 'DELIVERED') return true;
    if (current === 'IN_TRANSIT' && code === 'SHIPPED') return true;
    if (current === 'DELIVERED' && (code === 'SHIPPED' || code === 'IN_TRANSIT')) return true;
    return false;
  };

  const handleStatusChange = async (order: OrderResponseDto, nextName: string) => {
    const current = order.status.name.toUpperCase();
    const next = nextName.toUpperCase();
    if (current === next) return;

    const nextId = statusByName.get(next);
    if (nextId == null) {
      setRowError('Выбранный статус не найден в справочнике');
      return;
    }

    setRowError(null);
    setUpdatingOrderId(order.id);

    try {
      const res = await api.setOrderStatus(order.id, nextId);
      if (!res.success) {
        throw new Error(res.error || 'Не удалось обновить статус');
      }
      await loadOrders();
    } catch (e) {
      setRowError(e instanceof Error ? e.message : 'Ошибка сохранения');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const q = searchTerm.trim().toLowerCase().replace(/^№\s*/, '');
    if (!q) return true;
    const idStr = warehouseOrderNumber(o.id).toLowerCase();
    return idStr.includes(q);
  });

  const totalCost = filtered.reduce((s, o) => s + (o.totalAmount ?? 0), 0);

  if (isLoading) {
    return (
      <div className={styles['warehouse-shipment-main-content']}>
        <div className={styles['warehouse-shipment-header']}>
          <h1 className={styles['warehouse-shipment-page-title']}>Отгрузка</h1>
          <button type="button" className={styles['warehouse-shipment-back-button']} onClick={onBack}>
            Назад
          </button>
        </div>
        <div className={styles['warehouse-shipment-table-container']}>Загрузка…</div>
      </div>
    );
  }

  return (
    <div className={styles['warehouse-shipment-main-content']}>
      <div className={styles['warehouse-shipment-header']}>
        <h1 className={styles['warehouse-shipment-page-title']}>Отгрузка</h1>
        <button type="button" className={styles['warehouse-shipment-back-button']} onClick={onBack}>
          Назад
        </button>
      </div>

      <div className={styles['warehouse-shipment-stats-row']}>
        <div className={styles['warehouse-shipment-ready-info']}>
          <div className={styles['warehouse-shipment-ready-label']}>В работе на отгрузке</div>
          <div className={styles['warehouse-shipment-ready-count']}>{filtered.length}</div>
        </div>
        <div className={styles['warehouse-shipment-cost-info']}>
          <div className={styles['warehouse-shipment-cost-label']}>Сумма (отфильтр.)</div>
          <div className={styles['warehouse-shipment-cost-value']}>{totalCost.toLocaleString('ru-RU')} ₽</div>
        </div>
        <div className={styles['warehouse-shipment-search-wrapper']}>
          <input
            type="search"
            className={styles['warehouse-shipment-search-input']}
            placeholder="Поиск по номеру заказа"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {(error || rowError) && (
        <div className={styles['warehouse-shipment-alert']} role="alert">
          {error && <div>{error}</div>}
          {rowError && <div>{rowError}</div>}
        </div>
      )}

      <div className={styles['warehouse-shipment-table-container']}>
        <table className={styles['warehouse-shipment-table']}>
          <thead>
            <tr>
              <th className={styles['warehouse-shipment-col-order']}>Номер заказа</th>
              <th className={styles['warehouse-shipment-col-items']}>Состав</th>
              <th className={styles['warehouse-shipment-col-time']}>Дата</th>
              <th className={styles['warehouse-shipment-col-status']}>Статус</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles['warehouse-shipment-empty-row']}>
                  {orders.length > 0 && searchTerm.trim()
                    ? 'Нет заказов по этому номеру'
                    : 'Нет заказов на отгрузке, в пути или готовых к выдаче'}
                </td>
              </tr>
            ) : (
              filtered.map((order) => {
                const current = order.status.name.toUpperCase();
                const codes = optionsForRow(current);
                const busy = updatingOrderId === order.id;
                return (
                  <tr key={order.id}>
                    <td className={styles['warehouse-shipment-col-order']}>
                      {warehouseOrderNumber(order.id)}
                    </td>
                    <td className={styles['warehouse-shipment-col-items']}>
                      {itemsLabel(order.items.length)}
                    </td>
                    <td className={styles['warehouse-shipment-col-time']}>{formatDate(order.orderDate)}</td>
                    <td className={styles['warehouse-shipment-col-status']}>
                      <select
                        className={styles['warehouse-shipment-status-select']}
                        value={current}
                        disabled={busy}
                        onChange={(e) => void handleStatusChange(order, e.target.value)}
                        aria-label={`Статус отгрузки заказа ${warehouseOrderNumber(order.id)}`}
                      >
                        {codes.map((code) => (
                          <option key={code} value={code} disabled={optionDisabled(current, code)}>
                            {shipmentStatusOptionLabel(code)}
                          </option>
                        ))}
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

export default WarehouseShipment;
