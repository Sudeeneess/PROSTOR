import React from 'react';
import './HeaderManager.css';

interface HeaderManagerProps {
  activeTab?: 'priemka' | 'sborka' | 'otgruzka';
  onTabClick?: (tab: 'priemka' | 'sborka' | 'otgruzka') => void;
  onLoginClick?: () => void;
}

const HeaderManager: React.FC<HeaderManagerProps> = ({ 
  activeTab = 'priemka',
  onTabClick,
  onLoginClick 
}) => {
  
  const handleTabClick = (tab: 'priemka' | 'sborka' | 'otgruzka') => {
    if (onTabClick) {
      onTabClick(tab);
    }
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLoginClick) {
      onLoginClick();
    }
  };

  const getTabClass = (tab: 'priemka' | 'sborka' | 'otgruzka') => {
    let className = 'nav-item';
    if (activeTab === tab) {
      className += ' active';
    }
    return className;
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <span className="logo">PROSTOR</span>
        </div>

        <nav className="nav-menu">
          <a 
            href="#" 
            className={getTabClass('priemka')}
            onClick={(e) => {
              e.preventDefault();
              handleTabClick('priemka');
            }}
          >
            Приемка
          </a>
          <a 
            href="#" 
            className={getTabClass('sborka')}
            onClick={(e) => {
              e.preventDefault();
              handleTabClick('sborka');
            }}
          >
            Сборка
          </a>
          <a 
            href="#" 
            className={getTabClass('otgruzka')}
            onClick={(e) => {
              e.preventDefault();
              handleTabClick('otgruzka');
            }}
          >
            Отгрузка
          </a>
          <a 
            href="#" 
            className="login-link"
            onClick={handleLoginClick}
          >
            Войти
          </a>
        </nav>
      </div>
    </header>
  );
};

export default HeaderManager;