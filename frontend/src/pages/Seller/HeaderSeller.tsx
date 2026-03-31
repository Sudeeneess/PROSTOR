import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HeaderSeller.css";

const HeaderSeller: React.FC = () => {
  const navigate = useNavigate();

  const handleProductsClick = () => {
    navigate("/seller/products");
  };

  const handlePersonalClick = () => {
    navigate("/seller/dashboard"); // лучше сюда (у тебя такой роут уже есть)
  };

  return (
    <header className="header-section">
      <div className="logo-text">
        <span className="logo-prostor">prostor</span>
        <span className="logo-seller">Seller</span>
      </div>

      <nav className="navigation-bar">
        {/* ✅ ГЛАВНАЯ → MainSeller */}
        <Link to="/seller/start" className="navigation-link">
          Главная
        </Link>

        <button onClick={handleProductsClick} className="navigation-button">
          Товары
        </button>

        {/* ✅ ЗАКАЗЫ → OrdersSeller */}
        <Link to="/seller/orders" className="navigation-link">
          Заказы
        </Link>

        <button onClick={handlePersonalClick} className="navigation-button">
          Личный кабинет
        </button>
      </nav>
    </header>
  );
};

export default HeaderSeller;