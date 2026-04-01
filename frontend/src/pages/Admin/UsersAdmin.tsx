import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  onBack?: () => void;
}

const initialUsers: User[] = [
  { id: 15, name: 'Иванов И.', email: 'ivan@mail.ru', role: 'Покупатель', status: 'Активен' },
  { id: 16, name: 'Петров П.', email: 'petr@mail.ru', role: 'Продавец', status: 'Активен' },
  { id: 17, name: 'Сидоров С.', email: 'sidor@mail.ru', role: 'Менеджер', status: 'Активен' },
  { id: 18, name: 'Кузнецов А.', email: 'kuzn@mail.ru', role: 'Покупатель', status: 'Активен' },
];

// Ключ для localStorage
const USERS_STORAGE_KEY = 'app_users';

// Функция загрузки пользователей из localStorage
const loadUsersFromStorage = (): User[] => {
  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
  } catch (error) {
    console.error('Ошибка при загрузке пользователей:', error);
  }
  return initialUsers;
};

// Функция сохранения пользователей в localStorage
const saveUsersToStorage = (users: User[]) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Ошибка при сохранении пользователей:', error);
  }
};

const UsersAdmin: React.FC<UsersAdminProps> = ({ onBack }) => {
  const navigate = useNavigate();

  // Загружаем пользователей из localStorage при инициализации
  const [users, setUsers] = useState<User[]>(() => loadUsersFromStorage());
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active'>('all');
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Менеджер склада',
  });

  // Сохраняем пользователей в localStorage при каждом изменении
  useEffect(() => {
    saveUsersToStorage(users);
  }, [users]);

  // Фильтруем пользователей в зависимости от активной вкладки
  const filteredUsers = activeTab === 'all' 
    ? users 
    : users.filter(user => user.status === 'Активен');

  const handleSelectUser = (id: number) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };

  const openModal = () => {
    setShowModal(true);
    setNewUser({ firstName: '', lastName: '', email: '', role: 'Менеджер склада' });
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
    if (selectedUsers.length === 0) {
      alert('Пожалуйста, выберите пользователя');
      return;
    }

    if (selectedUsers.length > 1) {
      alert('Выберите только одного пользователя');
      return;
    }

    const userToEdit = users.find(user => user.id === selectedUsers[0]);

    if (userToEdit) {
      setSelectedUserForEdit(userToEdit);
      setShowEditModal(true);
    }
  };

  const handleSaveUser = async (updatedUser: User) => {
    // Имитация задержки сохранения
    await new Promise(resolve => setTimeout(resolve, 500));

    setUsers(prev =>
      prev.map(user =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );

    setSelectedUsers([]);
    setShowEditModal(false);
    showNotification('Пользователь обновлен!');
  };

  const handleBack = () => {
    if (onBack) {
      onBack(); // Используем пропс если он передан
    } else {
      navigate(-1); // Иначе возвращаемся на предыдущую страницу
    }
  };

  const handleTabChange = (tab: 'all' | 'active') => {
    setActiveTab(tab);
    setSelectedUsers([]);
  };

  return (
    <>
      {/* Убираем передачу пропса - просто рендерим HeaderAdmin без параметров */}
      <HeaderAdmin />

      <div className="UsersAdmin">
        <div className="users-container">
          <div className="users-header">
            <h1>Пользователи</h1>
            <button className="back-button" onClick={handleBack}>
              Назад
            </button>
          </div>

          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => handleTabChange('all')}
            >
              Все пользователи
            </button>
            <button 
              className={`tab ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => handleTabChange('active')}
            >
              Активные
            </button>
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
                {filteredUsers.map(user => (
                  <tr key={user.id}>
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
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                      Нет пользователей для отображения
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Кнопки действий как на скриншоте */}
          <div className="action-buttons">
            <button className="edit-button" onClick={handleEdit}>
              Редактировать пользователя
            </button>
            <button className="invite-button" onClick={openModal}>
              Пригласить сотрудника
            </button>
          </div>

          {/* Модальное окно для приглашения с крестиком */}
          {showModal && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-with-close">
                  <h2 className="modal-title">Данные нового сотрудника</h2>
                  <button className="modal-close-button" onClick={closeModal}>
                    ×
                  </button>
                </div>
                
                <div className="modal-form">
                  <div className="form-group">
                    <label>Имя:</label>
                    <input
                      type="text"
                      placeholder="Введите имя"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Фамилия:</label>
                    <input
                      type="text"
                      placeholder="Введите фамилию"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      placeholder="example@mail.ru"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Должность:</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="role-select"
                    >
                      <option value="Менеджер">Менеджер</option>
                      <option value="Покупатель">Покупатель</option>
                      <option value="Продавец">Продавец</option>
                    </select>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button className="submit-button" onClick={handleInvite}>
                    Отправить приглашение
                  </button>
                </div>
              </div>
            </div>
          )}

          <WindEditAdmin
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            userData={selectedUserForEdit}
            onSave={handleSaveUser}
          />

          {/* Toast уведомление */}
          {showToast && (
            <div className="toast-notification">
              {toastMessage}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UsersAdmin;