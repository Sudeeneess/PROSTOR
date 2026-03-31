import React from "react";
import { useNavigate } from "react-router-dom";
import HeaderSeller from "./HeaderSeller";
import "./MainSeller.css";

const MainSeller: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="seller-page">
      <HeaderSeller />

      <div className="seller-wrapper">
        {/* ЛЕВО */}
        <div className="left-block">
          <h1>Простор для вашего бизнеса</h1>

          <p className="desc">
            Начните продавать на маркетплейсе с удобной системой управления
            товарами и заказами
          </p>

          <button
            className="start-btn"
            onClick={() => navigate("/seller/register")}
          >
            Начать продавать
          </button>

          <div className="benefits">
            <div> • Простая аналитика</div>
            <div> • Выгодные условия</div>
            <div> • Безопасные сделки</div>
          </div>
        </div>

        {/* ПРАВО */}
        <div className="right-block">
          <h2>Как это работает</h2>

          <div className="steps">
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
          <div className="review">
            “Подключился за день, первые заказы через 2 дня”
            <span>— ООО “Вектор”, продаёт с 2023</span>
          </div>

          {/* FAQ */}
          <div className="faq">
            <h3>FAQ (частые вопросы)</h3>

            <div className="faq-item">
              <b>Сколько стоит подключение?</b>
              <p>Бесплатно</p>
            </div>

            <div className="faq-item">
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