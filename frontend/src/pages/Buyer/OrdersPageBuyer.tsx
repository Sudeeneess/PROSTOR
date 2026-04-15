import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoLocationOutline } from 'react-icons/io5';
import HeaderMain from '../../components/HeaderMain';
import OrderProductCard from '../../components/OrderProductCard';
import { api } from '../../services/api';
import type { OrderResponseDto } from '../../services/api/types/order';
import styles from './OrdersPageBuyer.module.css';

const PICKUP_ADDRESS = 'г. Новосибирск, Улица Блюхера 28';

type OrderCardView = {
  id: string;
  name: string;
  price: string;
  statusLabel: string;
  isReady: boolean;
};

function parseCustomerIdValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

async function resolveCustomerId(): Promise<number | null> {
  const fromLogin = api.getStoredCustomerId();
  if (fromLogin != null) return fromLogin;

  const dash = await api.getCustomerDashboard();
  if (!dash.success || !dash.data) return null;
  return parseCustomerIdValue(dash.data.customerId);
}

function mapOrderStatusLabel(statusName?: string): string {
  const normalized = (statusName ?? '').toUpperCase();
  if (normalized === 'PENDING') return 'Ожидает подтверждения';
  if (normalized === 'CONFIRMED') return 'Собран на складе';
  if (normalized === 'DELIVERED') return 'Можно забирать';
  if (normalized === 'CANCELLED') return 'Отменен';
  return statusName ?? 'Статус уточняется';
}

function toCards(orders: OrderResponseDto[]): OrderCardView[] {
  return orders.flatMap((order) => {
    const normalizedStatus = (order.status?.name ?? '').toUpperCase();
    const isReady = normalizedStatus === 'DELIVERED';
    const statusLabel = mapOrderStatusLabel(order.status?.name);

    return order.items.map((item) => ({
      id: `${order.id}-${item.id}`,
      name: item.productName?.trim() || `Товар #${item.productId}`,
      price: `${Number(item.amount || 0).toLocaleString('ru-RU')} ₽`,
      statusLabel,
      isReady,
    }));
  });
}

const OrdersPageBuyer: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadOrders = async () => {
      setIsLoading(true);
      setError(null);

      const customerId = await resolveCustomerId();
      if (customerId == null) {
        if (!isCancelled) {
          setError('Не удалось определить покупателя. Войдите в аккаунт заново.');
          setIsLoading(false);
        }
        return;
      }

      const response = await api.getOrdersForCustomer(customerId);
      if (!response.success || !response.data) {
        if (!isCancelled) {
          setError(response.error ?? 'Не удалось загрузить заказы.');
          setIsLoading(false);
        }
        return;
      }

      if (!isCancelled) {
        setOrders(response.data);
        setIsLoading(false);
      }
    };

    void loadOrders();
    return () => {
      isCancelled = true;
    };
  }, []);

  const cards = useMemo(() => toCards(orders), [orders]);
  const readyCards = useMemo(() => cards.filter((card) => card.isReady), [cards]);
  const transitCards = useMemo(() => cards.filter((card) => !card.isReady), [cards]);

  const renderCards = (list: OrderCardView[], emptyText: string) => {
    if (list.length === 0) {
      return <p className={styles['buyer-orders-empty']}>{emptyText}</p>;
    }
    return list.map((card) => (
      <OrderProductCard
        key={card.id}
        price={card.price}
        name={card.name}
        statusLabel={card.statusLabel}
      />
    ));
  };

  return (
    <div className={styles['buyer-orders-page']}>
      <HeaderMain variant="buyer" />

      <main className={styles['buyer-orders-main']}>
        <div className={styles['buyer-orders-container']}>
          <div className={styles['buyer-orders-title-row']}>
            <h1 className={styles['buyer-orders-title']}>Мои заказы</h1>
            <Link to="/profile" className={styles['buyer-orders-back']}>
              назад
            </Link>
          </div>

          <section className={styles['buyer-orders-section']} aria-labelledby="orders-ready-heading">
            <div className={styles['buyer-orders-section-head']}>
              <h2 id="orders-ready-heading" className={styles['buyer-orders-section-title']}>
                Готовы к получению
              </h2>
              <div className={styles['buyer-orders-address']}>
                <IoLocationOutline className={styles['buyer-orders-address-icon']} aria-hidden />
                <span>{PICKUP_ADDRESS}</span>
              </div>
            </div>

            <div className={styles['buyer-orders-scroll']}>
              {isLoading && <p className={styles['buyer-orders-empty']}>Загрузка заказов...</p>}
              {!isLoading && error && <p className={styles['buyer-orders-empty']}>{error}</p>}
              {!isLoading && !error && renderCards(readyCards, 'Пока нет заказов, готовых к выдаче.')}
            </div>
          </section>

          <section className={styles['buyer-orders-section']} aria-labelledby="orders-transit-heading">
            <h2 id="orders-transit-heading" className={`${styles['buyer-orders-section-title']} ${styles['buyer-orders-section-title--solo']}`}>
              В пути
            </h2>

            <div className={styles['buyer-orders-scroll']}>
              {isLoading && <p className={styles['buyer-orders-empty']}>Загрузка заказов...</p>}
              {!isLoading && error && <p className={styles['buyer-orders-empty']}>{error}</p>}
              {!isLoading && !error && renderCards(transitCards, 'Пока нет заказов в обработке.')}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default OrdersPageBuyer;
