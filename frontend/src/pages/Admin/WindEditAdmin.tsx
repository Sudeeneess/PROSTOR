import React, { useState, useEffect } from 'react';
import './WindEditAdmin.css';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface WindEditAdminProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData | null;
  onSave: (updatedUser: UserData) => void;
}

const WindEditAdmin: React.FC<WindEditAdminProps> = ({
  isOpen,
  onClose,
  userData,
  onSave
}) => {
  const [editedUser, setEditedUser] = useState<UserData | null>(null);
  const [pendingActions, setPendingActions] = useState<{
    block?: boolean;
    delete?: boolean;
  }>({});

  useEffect(() => {
    if (userData) {
      setEditedUser({ ...userData });
      setPendingActions({});
    }
  }, [userData]);

  const handleInputChange = (field: keyof UserData, value: string) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        [field]: value
      });
    }
  };

  const handleBlock = () => {
    setPendingActions(prev => ({
      ...prev,
      block: !prev.block
    }));
  };

  const handleDelete = () => {
    setPendingActions(prev => ({
      ...prev,
      delete: !prev.delete
    }));
  };

  const handleSave = () => {
    if (editedUser) {
      let updatedUser = { ...editedUser };
      
      // Применяем отложенные действия
      if (pendingActions.block) {
        updatedUser.status = 'Заблокирован';
      }
      if (pendingActions.delete) {
        updatedUser.status = 'Удален';
      }
      
      onSave(updatedUser);
      onClose();
    }
  };

  const getDisplayName = () => {
    if (!editedUser) return '';
    const nameParts = editedUser.name.split(' ');
    return nameParts[0] || '';
  };

  const getDisplayLastName = () => {
    if (!editedUser) return '';
    const nameParts = editedUser.name.split(' ');
    return nameParts[1] || '';
  };

  if (!isOpen || !editedUser) return null;

  return (
    <div className="wind-edit-overlay" onClick={onClose}>
      <div className="wind-edit-modal" onClick={e => e.stopPropagation()}>
        <div className="wind-edit-header">
          <h2>Информация о пользователе</h2>
          <button className="wind-edit-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="wind-edit-content">
          <div className="user-info-section">
            <h3>Пользователь</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Фамилия:</label>
                <input
                  type="text"
                  value={getDisplayName()}
                  onChange={(e) => {
                    const lastName = getDisplayLastName();
                    handleInputChange('name', `${e.target.value} ${lastName}`.trim());
                  }}
                  placeholder="Введите фамилию"
                />
              </div>
              
              <div className="form-group">
                <label>Имя:</label>
                <input
                  type="text"
                  value={getDisplayLastName()}
                  onChange={(e) => {
                    const firstName = getDisplayName();
                    handleInputChange('name', `${firstName} ${e.target.value}`.trim());
                  }}
                  placeholder="Введите имя"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={editedUser.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Введите email"
              />
            </div>

            <div className="form-group">
              <label>Должность:</label>
              <input
                type="text"
                value={editedUser.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                placeholder="Введите должность"
              />
            </div>
          </div>

          <div className="actions-section">
            <h3>Действия:</h3>
            <div className="action-buttons">
              <button 
                className={`action-button block-button ${pendingActions.block ? 'active' : ''}`}
                onClick={handleBlock}
              >
                Заблокировать 
              </button>
              <button 
                className={`action-button delete-button ${pendingActions.delete ? 'active' : ''}`}
                onClick={handleDelete}
              >
                Удалить 
              </button>
            </div>
          </div>
        </div>

        <div className="wind-edit-footer">
          <button className="save-button" onClick={handleSave}>
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
};

export default WindEditAdmin;