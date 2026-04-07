import React from "react";
import { useNavigate } from "react-router-dom";
import HeaderSeller from "./HeaderSeller";
import styles from './MainSeller.module.css';

const MainSeller: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('userRole');
    navigate("/");
  };

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
            className={styles['seller-start-btn']}
            onClick={() => navigate("/seller/register")}
          >
            Начать продавать
          </button>

          <div className={styles['seller-benefits']}>
            <div> • Простая аналитика</div>
            <div> • Выгодные условия</div>
            <div> • Безопасные сделки</div>
          </div>

          <button
            className={styles['seller-logout-btn']}
            onClick={handleLogout}
          >
            Выйти из аккаунта
          </button>
        </div>

        {/* ПРАВО */}
        <div className={styles['seller-right-block']}>
          <h2>Как это работает</h2>

          <div className={styles['seller-steps']}>
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

          <div className={styles['seller-review']}>
            “Подключился за день, первые заказы через 2 дня”
            <span>— ООО “Вектор”, продаёт с 2023</span>
          </div>

          <div className={styles['seller-faq']}>
            <h3>FAQ (частые вопросы)</h3>

            <div className={styles['seller-faq-item']}>
              <b>Сколько стоит подключение?</b>
              <p>Бесплатно</p>
            </div>

            <div className={styles['seller-faq-item']}>
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