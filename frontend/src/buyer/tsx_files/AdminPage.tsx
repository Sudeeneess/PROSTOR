import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Страница администратора</h1>
      <p>Добро пожаловать в личный кабинет администратора</p>
      <button onClick={() => navigate('/')}>Вернуться на главную</button>
    </div>
  );
};

export default AdminPage;

// ВРЕМЕННАЯ СТРАНИЦА