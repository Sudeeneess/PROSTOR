import React from "react";
import { useNavigate } from "react-router-dom";
import HeaderSeller from "./HeaderSeller";
import styles from './MainSeller.module.css';

const MainSeller: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles['seller-page']}>
      <HeaderSeller />

      <div className={styles['seller-wrapper']}>
        {/* ЛЕВО */}
        <div className={styles['left-block']}>
          <h1>Простор для вашего бизнеса</h1>

          <p className={styles['desc']}>
            Начните продавать на маркетплейсе с удобной системой управления
            товарами и заказами
          </p>

          <button
            className={styles['start-btn']}
            onClick={() => navigate("/seller/register")}
          >
            Начать продавать
          </button>

          <div className={styles['benefits']}>
            <div> • Простая аналитика</div>
            <div> • Выгодные условия</div>
            <div> • Безопасные сделки</div>
          </div>
        </div>

        {/* ПРАВО */}
        <div className={styles['right-block']}>
          <h2>Как это работает</h2>

          <div className={styles['steps']}>
            <div>
              <b>1. Регистрация</b>
              <p>Создайте аккаунт продавца</p>
            </div>

            <div>
              <b>2. Добавление товаров</b>
              <p>Загрузите каталог</p>
            </div>

            <div>
              <b>3. Управление продажами</b>
              <p>Принимайте заказы</p>
            </div>

            <div>
              <b>4. Вывод средств</b>
              <p>Получайте оплату</p>
            </div>
          </div>

          {/* ОТЗЫВ */}
          <div className={styles['review']}>
            “Подключился за день, первые заказы через 2 дня”
            <span>— ООО “Вектор”, продаёт с 2023</span>
          </div>

          {/* FAQ */}
          <div className={styles['faq']}>
            <h3>FAQ (частые вопросы)</h3>

            <div className={styles['faq-item']}>
              <b>Сколько стоит подключение?</b>
              <p>Бесплатно</p>
            </div>

            <div className={styles['faq-item']}>
              <b>Когда начнутся продажи?</b>
              <p>Обычно в течение 1-3 дней</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainSeller;