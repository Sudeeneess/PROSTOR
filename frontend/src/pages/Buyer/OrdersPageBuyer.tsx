import React from 'react';
import { Link } from 'react-router-dom';
import { IoLocationOutline } from 'react-icons/io5';
import HeaderMain from '../../components/HeaderMain';
import OrderProductCard from '../../components/OrderProductCard';
import styles from './OrdersPageBuyer.module.css';

const placeholder = {
  price: '000 ₽',
  name: 'Название товара',
};

const OrdersPageBuyer: React.FC = () => {
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
                <span>г. Новосибирск, Улица Блюхера 28</span>
              </div>
            </div>

            <div className={styles['buyer-orders-scroll']}>
              <OrderProductCard {...placeholder} statusLabel="Можно забирать" />
              <OrderProductCard {...placeholder} statusLabel="Можно забирать" />
              <OrderProductCard {...placeholder} statusLabel="Можно забирать" />
              <OrderProductCard {...placeholder} statusLabel="Можно забирать" />
              <OrderProductCard {...placeholder} statusLabel="Можно забирать" />
            </div>
          </section>

          <section className={styles['buyer-orders-section']} aria-labelledby="orders-transit-heading">
            <h2 id="orders-transit-heading" className={`${styles['buyer-orders-section-title']} ${styles['buyer-orders-section-title--solo']}`}>
              В пути
            </h2>

            <div className={styles['buyer-orders-scroll']}>
              <OrderProductCard {...placeholder} statusLabel="Едет в сортировочный центр" />
              <OrderProductCard {...placeholder} statusLabel="Собран на складе" />
              <OrderProductCard {...placeholder} statusLabel="Передан в доставку" />
              <OrderProductCard {...placeholder} statusLabel="Едет в сортировочный центр" />
              <OrderProductCard {...placeholder} statusLabel="Собран на складе" />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default OrdersPageBuyer;
