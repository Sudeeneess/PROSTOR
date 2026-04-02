import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HeaderSeller.css";

const HeaderSeller: React.FC = () => {
  const navigate = useNavigate();

  const handleProductsClick = () => {
    navigate("/seller/products");
  };

  const handlePersonalClick = () => {
    navigate("/seller/profile"); // Изменено на /seller/profile
  };

  return (
    <header className="seller-header-section">
      <div className="seller-header-logo-text">
        <span className="seller-header-logo-prostor">prostor</span>
        <span className="seller-header-logo-seller">Seller</span>
      </div>
      <nav className="seller-header-navigation-bar">
        <Link to="/" className="seller-header-navigation-link">На главную</Link>
        <button onClick={handleProductsClick} className="seller-header-navigation-button">
          Товары
        </button>
        <Link to="/seller/orders" className="seller-header-navigation-link">Заказы</Link>
        <button onClick={handlePersonalClick} className="seller-header-navigation-button">
          Личный кабинет
        </button>
      </nav>
    </header>
  );
};

export default HeaderSeller;