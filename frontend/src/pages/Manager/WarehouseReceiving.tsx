import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WindWarehouseReceiving, { type ReceptionLine } from './WindWarehouseReceiving';
import styles from './WarehouseReceiving.module.css';
import { api } from '../../services/api';
import type { GoodsReceptionDetailsDto, GoodsReceptionListDto } from '../../services/api';

interface WarehouseReceivingProps {
  onBack: () => void;
}

type StatusFilter = 'all' | 'pending' | 'accepted';

function formatReceptionDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const WarehouseReceiving: React.FC<WarehouseReceivingProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [receptions, setReceptions] = useState<GoodsReceptionListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [filterDate, setFilterDate] = useState('');
  const [filterSeller, setFilterSeller] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalReceptionId, setModalReceptionId] = useState<number | null>(null);
  const [modalDetail, setModalDetail] = useState<GoodsReceptionDetailsDto | null>(null);
  const [modalDetailLoading, setModalDetailLoading] = useState(false);
  const [modalDetailError, setModalDetailError] = useState<string | null>(null);

  const userRole = sessionStorage.getItem('userRole');
  const canAcceptOnServer = userRole === 'warehouse_manager';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = sessionStorage.getItem('userRole');
    if (!token || role !== 'warehouse_manager') {
      navigate('/warehouse/auth', { replace: true });
    }
  }, [navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.listGoodsReceptions({
        status:
          filterStatus === 'pending' ? 'PENDING' : filterStatus === 'accepted' ? 'ACCEPTED' : undefined,
        fromDate: filterDate || undefined,
        toDate: filterDate || undefined,
      });
      setReceptions(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
      setReceptions([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterDate]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!modalOpen || modalReceptionId == null) {
      setModalDetail(null);
      setModalDetailError(null);
      setModalDetailLoading(false);
      return;
    }
    let cancelled = false;
    setModalDetailLoading(true);
    setModalDetailError(null);
    void api
      .getGoodsReception(modalReceptionId)
      .then((d) => {
        if (!cancelled) setModalDetail(d);
      })
      .catch((e) => {
        if (!cancelled) {
          setModalDetailError(e instanceof Error ? e.message : 'Не удалось загрузить приёмку');
          setModalDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setModalDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [modalOpen, modalReceptionId]);

  const rows = useMemo(() => {
    const qSeller = filterSeller.trim().toLowerCase();
    return receptions.filter((r) => {
      if (!qSeller) return true;
      const blob = `${r.sellerCompanyName ?? ''} ${r.sellerId}`.toLowerCase();
      return blob.includes(qSeller);
    });
  }, [receptions, filterSeller]);

  const openModal = (id: number) => {
    setModalReceptionId(id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalReceptionId(null);
    setModalDetail(null);
    setModalDetailError(null);
  };

  const modalLines: ReceptionLine[] = useMemo(() => {
    if (!modalDetail?.products) return [];
    return modalDetail.products.map((p) => ({
      productName: p.productName,
      quantity: p.quantityOnWarehouse ?? 0,
    }));
  }, [modalDetail]);

  const handleCompleteReception = async () => {
    if (modalReceptionId == null || !canAcceptOnServer) return;
    await api.acceptGoodsReception(modalReceptionId);
    await load();
  };

  const modalAlreadyAccepted = modalDetail?.status === 'ACCEPTED';
  const modalSellerTitle = modalDetail?.sellerCompanyName ?? '—';
  const modalDateLabel = formatReceptionDate(modalDetail?.createdAt);

  return (
    <div className={styles['warehouse-receiving-content']}>
      <div className={styles['warehouse-receiving-container']}>
        <div className={styles['warehouse-receiving-header']}>
          <h1 className={styles['warehouse-receiving-title']}>Приёмка товара</h1>
          <div className={styles['warehouse-receiving-header-actions']}>
            <button
              type="button"
              className={styles['warehouse-receiving-refresh-button']}
              onClick={() => void load()}
              disabled={loading}
            >
              Обновить
            </button>
            <button type="button" className={styles['warehouse-receiving-back-button']} onClick={onBack}>
              Назад
            </button>
          </div>
        </div>

        <div className={styles['warehouse-receiving-filters']}>
          <label className={styles['warehouse-receiving-filter']}>
            <span>Статус</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
              className={styles['warehouse-receiving-filter-control']}
            >
              <option value="all">Все статусы</option>
              <option value="pending">Ожидает приёмки</option>
              <option value="accepted">Принято</option>
            </select>
          </label>
          <label className={styles['warehouse-receiving-filter']}>
            <span>Дата создания</span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className={styles['warehouse-receiving-filter-control']}
            />
          </label>
          <label className={`${styles['warehouse-receiving-filter']} ${styles['warehouse-receiving-filter-grow']}`}>
            <span>Организация или id продавца</span>
            <input
              type="search"
              placeholder="Название организации или id продавца"
              value={filterSeller}
              onChange={(e) => setFilterSeller(e.target.value)}
              className={styles['warehouse-receiving-filter-control']}
            />
          </label>
        </div>

        {error && (
          <div className={styles['warehouse-receiving-error']} role="alert">
            {error}
          </div>
        )}

        <div className={styles['warehouse-receiving-table-container']}>
          <table className={styles['warehouse-receiving-table']}>
            <thead>
              <tr>
                <th>Организация</th>
                <th>Позиций</th>
                <th>Дата</th>
                <th>Статус</th>
                <th className={styles['warehouse-receiving-col-action']} />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className={styles['warehouse-receiving-table-empty']}>
                    Загрузка…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles['warehouse-receiving-table-empty']}>
                    Нет записей по выбранным фильтрам
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className={styles['warehouse-receiving-seller-cell']}>
                        <span className={styles['warehouse-receiving-seller-title']}>
                          {r.sellerCompanyName || `Продавец #${r.sellerId}`}
                        </span>
                        <span className={styles['warehouse-receiving-seller-sub']}>id: {r.sellerId}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles['warehouse-receiving-qty-main']}>{r.positionsCount}</span>
                      <span className={styles['warehouse-receiving-qty-sub']}> позиций</span>
                    </td>
                    <td>{formatReceptionDate(r.createdAt)}</td>
                    <td>
                      <span
                        className={`${styles['warehouse-receiving-status-badge']} ${
                          r.status === 'PENDING'
                            ? styles['warehouse-receiving-status-pending']
                            : styles['warehouse-receiving-status-accepted']
                        }`}
                      >
                        {r.status === 'PENDING' ? 'Ожидает приёмки' : 'Принято'}
                      </span>
                    </td>
                    <td className={styles['warehouse-receiving-col-action']}>
                      <button
                        type="button"
                        className={styles['warehouse-receiving-open-button']}
                        onClick={() => openModal(r.id)}
                      >
                        Открыть
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <WindWarehouseReceiving
          isOpen={modalOpen}
          onClose={closeModal}
          onComplete={handleCompleteReception}
          sellerTitle={modalSellerTitle}
          sellerSubtitle={modalDetailError ? undefined : `Приёмка №${modalReceptionId ?? ''}`}
          batchDateLabel={modalDateLabel}
          lines={modalLines}
          linesLoading={modalDetailLoading}
          completeDisabled={
            !canAcceptOnServer ||
            modalAlreadyAccepted ||
            modalDetailLoading ||
            !!modalDetailError ||
            modalDetail == null
          }
          footerNote={
            !canAcceptOnServer
              ? 'Завершить приёмку может только менеджер склада (роль warehouse_manager).'
              : modalDetailError
                ? modalDetailError
                : undefined
          }
        />
      )}
    </div>
  );
};

export default WarehouseReceiving;
