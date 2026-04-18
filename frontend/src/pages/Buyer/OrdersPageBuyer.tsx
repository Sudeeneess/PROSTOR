import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoLocationOutline } from 'react-icons/io5';
import HeaderMain from '../../components/HeaderMain';
import OrderProductCard from '../../components/OrderProductCard';
import { api } from '../../services/api';
import type { OrderResponseDto } from '../../services/api/types/order';
import { buyerOrderStatusLabelRu } from '../../utils/warehouseOrderStatus';
import styles from './OrdersPageBuyer.module.css';

const PICKUP_ADDRESS = 'г. Новосибирск, Улица Блюхера 28';

type OrderCardView = {
  id: string;
  name: string;
  price: string;
  statusLabel: string;
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

function orderStatusNorm(order: OrderResponseDto): string {
  return (order.status?.name ?? '').toUpperCase();
}

function toCards(orders: OrderResponseDto[]): OrderCardView[] {
  return orders.flatMap((order) =>
    order.items.map((item) => ({
      id: `${order.id}-${item.id}`,
      name: item.productName?.trim() || `Товар #${item.productId}`,
      price: `${Number(item.amount || 0).toLocaleString('ru-RU')} ₽`,
      statusLabel: buyerOrderStatusLabelRu(order.status?.name),
    }))
  );
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

  const readyOrders = useMemo(
    () => orders.filter((o) => orderStatusNorm(o) === 'DELIVERED'),
    [orders]
  );
  const completedOrders = useMemo(
    () => orders.filter((o) => orderStatusNorm(o) === 'ISSUED'),
    [orders]
  );
  const activeOrders = useMemo(
    () =>
      orders.filter((o) => {
        const s = orderStatusNorm(o);
        return s !== 'DELIVERED' && s !== 'ISSUED';
      }),
    [orders]
  );

  const readyCards = useMemo(() => toCards(readyOrders), [readyOrders]);
  const activeCards = useMemo(() => toCards(activeOrders), [activeOrders]);
  const completedCards = useMemo(() => toCards(completedOrders), [completedOrders]);

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
              {!isLoading &&
                !error &&
                renderCards(readyCards, 'Пока нет заказов, готовых к выдаче.')}
            </div>
          </section>

          <section className={styles['buyer-orders-section']} aria-labelledby="orders-active-heading">
            <h2 id="orders-active-heading" className={`${styles['buyer-orders-section-title']} ${styles['buyer-orders-section-title--solo']}`}>
              Активные заказы
            </h2>

            <div className={styles['buyer-orders-scroll']}>
              {isLoading && <p className={styles['buyer-orders-empty']}>Загрузка заказов...</p>}
              {!isLoading && error && <p className={styles['buyer-orders-empty']}>{error}</p>}
              {!isLoading &&
                !error &&
                renderCards(
                  activeCards,
                  'Нет активных заказов (ожидается сборка, в пути и т.д.).'
                )}
            </div>
          </section>

          <section className={styles['buyer-orders-section']} aria-labelledby="orders-done-heading">
            <h2 id="orders-done-heading" className={`${styles['buyer-orders-section-title']} ${styles['buyer-orders-section-title--solo']}`}>
              Завершённые
            </h2>

            <div className={styles['buyer-orders-scroll']}>
              {isLoading && <p className={styles['buyer-orders-empty']}>Загрузка заказов...</p>}
              {!isLoading && error && <p className={styles['buyer-orders-empty']}>{error}</p>}
              {!isLoading &&
                !error &&
                renderCards(completedCards, 'Пока нет выданных заказов.')}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default OrdersPageBuyer;
