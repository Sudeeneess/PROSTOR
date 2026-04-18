import React from "react";
import { useNavigate } from "react-router-dom";
import HeaderSeller from "./HeaderSeller";
import styles from './MainSeller.module.css';

const MainSeller: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={`seller-app-shell ${styles['seller-page']}`}>
      <HeaderSeller />

      <main className={styles['seller-main']}>
        <div className={styles['seller-wrapper']}>
          <section className={styles['seller-hero']} aria-labelledby="seller-hero-title">
            <p className={styles['seller-hero-eyebrow']}>Маркетплейс PROSTOR</p>
            <h1 id="seller-hero-title" className={styles['seller-hero-title']}>
              Простор для вашего бизнеса
            </h1>
            <p className={styles['seller-hero-lead']}>
              Расскажите покупателям о своих товарах: удобный кабинет, каталог и
              заказы в одном месте. Подключение бесплатное — начните с регистрации.
            </p>
            <ul className={styles['seller-benefits']} aria-label="Преимущества">
              <li>Простая аналитика и учёт заказов</li>
              <li>Выгодные условия размещения</li>
              <li>Безопасные сделки для вас и покупателей</li>
            </ul>
            <div className={styles['seller-hero-cta-wrap']}>
              <button
                type="button"
                className={styles['seller-start-btn']}
                onClick={() => navigate('/seller/auth')}
              >
                Начать продавать
              </button>
              <button
                type="button"
                className={styles['seller-login-btn']}
                onClick={() => navigate('/seller/auth')}
              >
                Войти в личный кабинет
              </button>
              <p className={styles['seller-cta-note']}>
                Регистрация займёт несколько минут
              </p>
            </div>
          </section>

          <aside className={styles['seller-info-panel']} aria-label="Как это работает">
            <h2 className={styles['seller-panel-title']}>Как это работает</h2>
            <ol className={styles['seller-steps']}>
              <li>
                <strong>Регистрация</strong>
                <span>Создайте аккаунт продавца и заполните профиль</span>
              </li>
              <li>
                <strong>Добавление товаров</strong>
                <span>Загрузите каталог: фото, цены, остатки</span>
              </li>
              <li>
                <strong>Продажи</strong>
                <span>Принимайте и обрабатывайте заказы</span>
              </li>
              <li>
                <strong>Оплата</strong>
                <span>Вывод средств по правилам площадки</span>
              </li>
            </ol>

            <figure className={styles['seller-review']}>
              <blockquote>
                «Подключились за день, первые заказы через пару дней»
              </blockquote>
              <figcaption>ООО «Вектор», с 2023 года</figcaption>
            </figure>

            <div className={styles['seller-faq']}>
              <h3 className={styles['seller-faq-heading']}>Частые вопросы</h3>
              <div className={styles['seller-faq-item']}>
                <b>Сколько стоит подключение?</b>
                <p>Бесплатно</p>
              </div>
              <div className={styles['seller-faq-item']}>
                <b>Когда начнутся продажи?</b>
                <p>Обычно в течение 1–3 дней после модерации каталога</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default MainSeller;