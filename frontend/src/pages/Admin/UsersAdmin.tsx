import React, { useState } from 'react';
import './UsersAdmin.css';
import HeaderAdmin from './HeaderAdmin';
import WindEditAdmin from './WindEditAdmin';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface UsersAdminProps {
  onBack: () => void;
}

const initialUsers: User[] = [
  { id: 15, name: 'Иванов И.', email: 'ivan@mail.ru', role: 'Покупатель', status: 'Активен' },
  { id: 16, name: 'Петров П.', email: 'petr@mail.ru', role: 'Продавец', status: 'Активен' },
  { id: 17, name: 'Сидоров С.', email: 'sidor@mail.ru', role: 'Менеджер', status: 'Активен' },
  { id: 18, name: 'Кузнецов А.', email: 'kuzn@mail.ru', role: 'Покупатель', status: 'Активен' },
];

const UsersAdmin: React.FC<UsersAdminProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Менеджер',
  });

  const handleSelectUser = (id: number) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };

  const openModal = () => {
    setShowModal(true);
    setNewUser({ firstName: '', lastName: '', email: '', role: 'Менеджер' });
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleInvite = () => {
    if (newUser.firstName && newUser.lastName && newUser.email) {
      const newUserId = Math.max(...users.map(u => u.id), 0) + 1;
      const newUserObj: User = {
        id: newUserId,
        name: `${newUser.lastName} ${newUser.firstName.charAt(0)}.`,
        email: newUser.email,
        role: newUser.role,
        status: 'Активен',
      };
      setUsers([...users, newUserObj]);
      closeModal();
      showNotification('Вы пригласили нового пользователя!');
    } else {
      alert('Пожалуйста, заполните все поля');
    }
  };

  const handleEdit = () => {
    console.log('Edit button clicked, selectedUsers:', selectedUsers);
    
    if (selectedUsers.length === 0) {
      alert('Пожалуйста, выберите пользователя для редактирования');
      return;
    }
    
    if (selectedUsers.length > 1) {
      alert('Пожалуйста, выберите только одного пользователя для редактирования');
      return;
    }
    
    const userToEdit = users.find(user => user.id === selectedUsers[0]);
    console.log('User to edit:', userToEdit);
    
    if (userToEdit) {
      setSelectedUserForEdit(userToEdit);
      setShowEditModal(true);
    } else {
      alert('Пользователь не найден');
    }
  };

  const handleSaveUser = async (updatedUser: User) => {
    console.log('Saving updated user:', updatedUser);
    setIsSaving(true);
    
    // Имитация асинхронной операции сохранения
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        )
      );
      setSelectedUsers([]);
      setShowEditModal(false);
      showNotification('Пользователь успешно обновлен!');
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Произошла ошибка при сохранении пользователя');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoBack = () => {
    onBack();
  };

  return (
    <>
      <HeaderAdmin />
      <div className="UsersAdmin">
        <div className="users-container">
          <div className="users-header">
            <h1>Пользователи</h1>
            <button className="back-button" onClick={handleGoBack}>
              Назад
            </button>
          </div>

          <div className="tabs">
            <button className="tab active">Все пользователи</button>
            <button className="tab">Активные</button>
          </div>

          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th className="checkbox-cell"></th>
                  <th>ID</th>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr 
                    key={user.id} 
                    onClick={() => handleSelectUser(user.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </td>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedUsers.length > 0 && (
            <div className="edit-button-container">
              <button 
                className="edit-button" 
                onClick={handleEdit}
                disabled={isSaving}
              >
                {isSaving ? 'Сохранение...' : `Редактировать пользователя ${selectedUsers.length === 1 ? `(${selectedUsers.length})` : ''}`}
              </button>
            </div>
          )}

          <div className="invite-button-container">
            <button className="invite-button" onClick={openModal}>
              Пригласить сотрудника
            </button>
          </div>

          {showModal && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Пригласить сотрудника</h2>
                  <button className="close-button" onClick={closeModal}>
                    ✕
                  </button>
                </div>
                <div className="modal-body">
                  <h3>Данные нового сотрудника</h3>
                  <div className="form-group">
                    <label>Имя:</label>
                    <input
                      type="text"
                      value={newUser.firstName}
                      onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Фамилия:</label>
                    <input
                      type="text"
                      value={newUser.lastName}
                      onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Должность:</label>
                    <select
                      value={newUser.role}
                      onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                      className="role-select"
                    >
                      <option value="Менеджер">Менеджер</option>
                      <option value="Продавец">Продавец</option>
                      <option value="Покупатель">Покупатель</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="invite-submit-button" onClick={handleInvite}>
                    Отправить приглашение
                  </button>
                </div>
              </div>
            </div>
          )}

          {showToast && (
            <div className="toast">
              {toastMessage}
              <button className="toast-close" onClick={() => setShowToast(false)}>
                ✕
              </button>
            </div>
          )}

          <WindEditAdmin
            isOpen={showEditModal}
            onClose={() => {
              console.log('Closing edit modal');
              setShowEditModal(false);
              setSelectedUserForEdit(null);
            }}
            userData={selectedUserForEdit}
            onSave={handleSaveUser}
          />
        </div>
      </div>
    </>
  );
};

export default UsersAdmin;