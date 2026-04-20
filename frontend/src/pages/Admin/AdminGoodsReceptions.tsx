import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderAdmin from './HeaderAdmin';
import WarehouseReceiving from '../Manager/WarehouseReceiving';

const AdminGoodsReceptions: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <HeaderAdmin />
      <WarehouseReceiving onBack={() => navigate('/admin')} />
    </>
  );
};

export default AdminGoodsReceptions;
