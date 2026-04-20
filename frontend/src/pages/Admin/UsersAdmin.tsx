import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UsersAdmin.module.css';
import HeaderAdmin from './HeaderAdmin';
import WindEditAdmin, { type WindEditSavePayload, type WindEditVariant } from './WindEditAdmin';
import { appendAdminAction } from './adminActionLog';
import { api } from '../../services/api';
import type { AdminUserDto } from '../../services/api';

interface UsersAdminProps {
  onBack?: () => void;
}

function formatRoleName(roleName: string): string {
  switch (roleName) {
    case 'ADMIN':
      return 'Администратор';
    case 'CUSTOMER':
      return 'Покупатель';
    case 'SELLER':
      return 'Продавец';
    case 'WAREHOUSE_MANAGER':
      return 'Менеджер склада';
    default:
      return roleName;
  }
}

function formatCreatedAt(iso?: string): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function getEditVariant(user: AdminUserDto): WindEditVariant {
  const r = (user.role?.name ?? '').toUpperCase();
  if (r === 'WAREHOUSE_MANAGER') return 'manager';
  if (r === 'CUSTOMER' || r === 'SELLER') return 'customer_or_seller';
  return 'admin_view';
}

/** Уникальный 11-значный телефон для API (поле скрыто в форме приглашения). */
function generatePlaceholderPhone(): string {
  const base = Date.now() % 10_000_000_000;
  const pad = String(base).padStart(10, '0');
  return `8${pad}`.slice(0, 11);
}

const UsersAdmin: React.FC<UsersAdminProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [warehouseManagerRoleId, setWarehouseManagerRoleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<AdminUserDto | null>(null);
  const [editVariant, setEditVariant] = useState<WindEditVariant>('admin_view');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ userName: '', password: '' });
  const [usernameLookup, setUsernameLookup] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupBusy, setLookupBusy] = useState(false);

  const loadRoles = useCallback(async () => {
    setRolesError(null);
    try {
      const rows = await api.getDebugRoles();
      const wm = rows.find((r) => r.role_name === 'WAREHOUSE_MANAGER');
      setWarehouseManagerRoleId(wm?.role_id ?? null);
    } catch (e) {
      setRolesError(
        e instanceof Error ? e.message : 'Не удалось загрузить список ролей (/api/debug/roles)'
      );
      setWarehouseManagerRoleId(null);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setListError(null);
    try {
      const list = await api.getAdminUsers();
      setUsers(list);
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Не удалось загрузить пользователей');
      setUsers([]);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadRoles(), loadUsers()]);
    setLoading(false);
  }, [loadRoles, loadUsers]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleUsernameLookup = async () => {
    const u = usernameLookup.trim();
    if (!u) {
      setLookupError('Введите логин');
      return;
    }
    setLookupBusy(true);
    setLookupError(null);
    try {
      const user = await api.getAdminUserByUsername(u);
      setSelectedUsers([user.id]);
      showNotification(`Найден: #${user.id} · ${user.userName} · ${user.role?.name ?? '—'}`);
    } catch (e) {
      setLookupError(e instanceof Error ? e.message : 'Пользователь не найден');
    } finally {
      setLookupBusy(false);
    }
  };

  const handleSelectUser = (id: number) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const openModal = () => {
    setInviteError(null);
    setNewUser({ userName: '', password: '' });
    if (warehouseManagerRoleId == null) {
      setInviteError('Не найдена роль «Менеджер склада». Проверьте /api/debug/roles.');
    }
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleInvite = async () => {
    setInviteError(null);
    if (warehouseManagerRoleId == null) {
      setInviteError('Роль менеджера не загружена');
      return;
    }
    const { userName, password } = newUser;
    if (!userName.trim() || !password.trim()) {
      setInviteError('Заполните логин и пароль');
      return;
    }
    setInviteSubmitting(true);
    try {
      let phone = generatePlaceholderPhone();
      let created = false;
      for (let i = 0; i < 8; i++) {
        try {
          await api.createAdminUser({
            userName: userName.trim(),
            password: password.trim(),
            contactPhone: phone,
            roleId: warehouseManagerRoleId,
          });
          created = true;
          break;
        } catch (e) {
          const msg = e instanceof Error ? e.message : '';
          if (msg.includes('Phone number already exists') || msg.includes('телефон')) {
            phone = generatePlaceholderPhone();
            continue;
          }
          throw e;
        }
      }
      if (!created) {
        throw new Error('Не удалось создать пользователя: заняты служебные телефоны, попробуйте снова');
      }
      appendAdminAction({
        action: 'Создан менеджер склада',
        userLabel: userName.trim(),
        status: 'Выполнено',
      });
      closeModal();
      showNotification('Менеджер склада создан');
      await loadUsers();
      setSelectedUsers([]);
    } catch (e) {
      setInviteError(e instanceof Error ? e.message : 'Ошибка создания пользователя');
    } finally {
      setInviteSubmitting(false);
    }
  };

  const handleEdit = () => {
    if (selectedUsers.length === 0) {
      alert('Выберите пользователя');
      return;
    }
    if (selectedUsers.length > 1) {
      alert('Выберите только одного пользователя');
      return;
    }
    const u = users.find((user) => user.id === selectedUsers[0]);
    if (u) {
      setEditVariant(getEditVariant(u));
      setSelectedUserForEdit(u);
      setShowEditModal(true);
    }
  };

  const handleWindSave = async (payload: WindEditSavePayload) => {
    const u = selectedUserForEdit;
    if (u == null) return;
    const id = u.id;
    const roleName = u.role?.name ?? '';

    if (payload.shouldDelete) {
      if (!window.confirm(`Удалить пользователя #${id} (${payload.userName})?`)) {
        return;
      }
      await api.deleteAdminUser(id);
      appendAdminAction({
        action: `Удалён пользователь (${formatRoleName(roleName)})`,
        userLabel: payload.userName,
        status: 'Выполнено',
      });
      setShowEditModal(false);
      setSelectedUserForEdit(null);
      setSelectedUsers([]);
      showNotification('Пользователь удалён');
      await loadUsers();
      return;
    }

    if (warehouseManagerRoleId == null || warehouseManagerRoleId <= 0) {
      throw new Error('Не загружена роль менеджера');
    }

    await api.updateAdminUser(id, {
      userName: payload.userName,
      password: payload.password,
      contactPhone: payload.contactPhone,
      roleId: warehouseManagerRoleId,
    });
    appendAdminAction({
      action: 'Обновлены данные менеджера склада',
      userLabel: payload.userName,
      status: 'Выполнено',
    });
    setShowEditModal(false);
    setSelectedUserForEdit(null);
    setSelectedUsers([]);
    showNotification('Данные менеджера обновлены');
    await loadUsers();
  };

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <>
      <HeaderAdmin />

      <div className={styles['admin-users-container']}>
        <div className={styles['admin-users-main-container']}>
          <div className={styles['admin-users-header']}>
            <h1>Пользователи</h1>
            <button type="button" className={styles['admin-users-back-button']} onClick={handleBack}>
              Назад
            </button>
          </div>

          {(listError || rolesError) && (
            <div className={styles['admin-users-error']} role="alert">
              {listError && <p>{listError}</p>}
              {rolesError && <p>Роли: {rolesError}</p>}
            </div>
          )}

          <div className={styles['admin-users-lookup-row']}>
            <input
              type="search"
              className={styles['admin-users-lookup-input']}
              value={usernameLookup}
              onChange={(e) => setUsernameLookup(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleUsernameLookup();
              }}
              placeholder="Точный логин"
              aria-label="Поиск пользователя по точному логину"
              autoComplete="username"
            />
            <button
              type="button"
              className={styles['admin-users-lookup-button']}
              disabled={lookupBusy}
              onClick={() => void handleUsernameLookup()}
            >
              {lookupBusy ? 'Поиск…' : 'Найти'}
            </button>
            {lookupError ? (
              <span className={styles['admin-users-lookup-error']} role="alert">
                {lookupError}
              </span>
            ) : null}
          </div>

          {loading ? (
            <p className={styles['admin-users-loading']}>Загрузка…</p>
          ) : (
            <>
              <div className={styles['admin-users-table-wrapper']}>
                <table className={styles['admin-users-table']}>
                  <thead>
                    <tr>
                      <th className={styles['admin-users-checkbox-cell']} />
                      <th>ID</th>
                      <th>Логин</th>
                      <th>Телефон</th>
                      <th>Роль</th>
                      <th>Регистрация</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td
                          className={styles['admin-users-checkbox-cell']}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                          />
                        </td>
                        <td>{user.id}</td>
                        <td>{user.userName}</td>
                        <td>{user.contactPhone || '—'}</td>
                        <td>{user.role ? formatRoleName(user.role.name) : '—'}</td>
                        <td>{formatCreatedAt(user.createdAt)}</td>
                      </tr>
                    ))}
                    {users.length === 0 && !listError && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                          Нет пользователей
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className={styles['admin-users-action-buttons']}>
                <button type="button" className={styles['admin-users-edit-button']} onClick={handleEdit}>
                  Открыть карточку
                </button>
                <button type="button" className={styles['admin-users-invite-button']} onClick={openModal}>
                  Добавить менеджера склада
                </button>
              </div>
            </>
          )}

          {showModal && (
            <div className={styles['admin-users-modal-overlay']} onClick={closeModal}>
              <div className={styles['admin-users-invite-modal']} onClick={(e) => e.stopPropagation()}>
                <div className={styles['admin-users-modal-header-with-close']}>
                  <h2 className={styles['admin-users-modal-title']}>Новый менеджер склада</h2>
                  <button type="button" className={styles['admin-users-modal-close-button']} onClick={closeModal}>
                    ×
                  </button>
                </div>

                <div className={styles['admin-users-modal-form']}>
                  <div className={styles['admin-users-form-group']}>
                    <label>Логин:</label>
                    <input
                      type="text"
                      value={newUser.userName}
                      onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
                      placeholder="Имя пользователя"
                      autoComplete="username"
                    />
                  </div>
                  <div className={styles['admin-users-form-group']}>
                    <label>Пароль:</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Пароль"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className={styles['admin-users-form-group']}>
                    <label>Роль:</label>
                    <input type="text" value="Менеджер склада" disabled className={styles['admin-users-role-readonly']} />
                  </div>
                </div>

                {inviteError && (
                  <p className={styles['admin-users-invite-error']} role="alert">
                    {inviteError}
                  </p>
                )}

                <div className={styles['admin-users-modal-actions']}>
                  <button
                    type="button"
                    className={styles['admin-users-submit-button']}
                    onClick={() => void handleInvite()}
                    disabled={inviteSubmitting || warehouseManagerRoleId == null}
                  >
                    {inviteSubmitting ? 'Создание…' : 'Создать'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <WindEditAdmin
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            userData={selectedUserForEdit}
            variant={editVariant}
            warehouseManagerRoleId={warehouseManagerRoleId ?? 0}
            onSave={handleWindSave}
          />

          {showToast && (
            <div className={styles['admin-users-toast-notification']}>{toastMessage}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default UsersAdmin;
