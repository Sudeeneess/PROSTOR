import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WindWarehouseReceiving, { type ReceptionLine } from './WindWarehouseReceiving';
import styles from './WarehouseReceiving.module.css';
import { api } from '../../services/api';
import type { Product, WarehouseStockResponse } from '../../services/api';
import {
  buildReceptionBatches,
  formatDateKeyRu,
  getReceptionBatchStatus,
  getSellerDisplayForReception,
  sellerLoginStorageKey,
  setReceptionBatchAccepted,
} from '../../utils/warehouseReception';

interface WarehouseReceivingProps {
  onBack: () => void;
}

type StatusFilter = 'all' | 'pending' | 'accepted';

async function fetchAllProducts(): Promise<Product[]> {
  const all: Product[] = [];
  let page = 0;
  const size = 100;
  let totalPages = 1;
  while (page < totalPages) {
    const res = await api.getProducts({ page, size });
    if (!res.success || !res.data) break;
    const data = res.data;
    all.push(...(data.content ?? []));
    totalPages = data.totalPages ?? 1;
    page += 1;
  }
  return all;
}

const WarehouseReceiving: React.FC<WarehouseReceivingProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<WarehouseStockResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusVersion, setStatusVersion] = useState(0);

  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [filterDate, setFilterDate] = useState('');
  const [filterSeller, setFilterSeller] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalBatchKey, setModalBatchKey] = useState<string | null>(null);

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
      const [plist, sres] = await Promise.all([
        fetchAllProducts(),
        api.getWarehouseStocks(),
      ]);
      setProducts(plist);
      if (sres.success && sres.data) {
        setStocks(sres.data);
      } else {
        setStocks([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const qtyByProductId = useMemo(() => {
    const m = new Map<number, number>();
    for (const s of stocks) {
      const pid = s.productId;
      if (pid == null) continue;
      m.set(pid, (m.get(pid) ?? 0) + (s.quantity ?? 0));
    }
    return m;
  }, [stocks]);

  const batches = useMemo(() => buildReceptionBatches(products), [products]);

  const rows = useMemo(() => {
    const qSeller = filterSeller.trim().toLowerCase();
    const qDate = filterDate.trim();

    return batches
      .map((b) => {
        const snap = getSellerDisplayForReception(b.sellerId);
        const status = getReceptionBatchStatus(b.sellerId, b.dateKey);
        const skuCount = b.products.length;
        const storedLogin = localStorage.getItem(sellerLoginStorageKey(b.sellerId)) ?? '';
        const searchBlob =
          `${snap.title} ${snap.subtitle ?? ''} ${storedLogin} ${b.sellerId}`.toLowerCase();
        return {
          ...b,
          snap,
          status,
          skuCount,
          dateLabel: formatDateKeyRu(b.dateKey),
          searchBlob,
        };
      })
      .filter((r) => {
        if (filterStatus === 'pending' && r.status !== 'pending') return false;
        if (filterStatus === 'accepted' && r.status !== 'accepted') return false;
        if (qDate && r.dateKey !== qDate) return false;
        if (qSeller && !r.searchBlob.includes(qSeller)) return false;
        return true;
      });
  }, [batches, filterStatus, filterDate, filterSeller, statusVersion]);

  const openModal = (key: string) => {
    setModalBatchKey(key);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalBatchKey(null);
  };

  const modalBatch = useMemo(() => {
    if (!modalBatchKey) return null;
    return batches.find((b) => b.key === modalBatchKey) ?? null;
  }, [batches, modalBatchKey]);

  const modalLines: ReceptionLine[] = useMemo(() => {
    if (!modalBatch) return [];
    return modalBatch.products.map((p) => ({
      productName: p.name,
      quantity: qtyByProductId.get(p.id) ?? 0,
    }));
  }, [modalBatch, qtyByProductId]);

  const handleCompleteReception = () => {
    if (!modalBatch) return;
    if (getReceptionBatchStatus(modalBatch.sellerId, modalBatch.dateKey) === 'accepted') return;
    setReceptionBatchAccepted(modalBatch.sellerId, modalBatch.dateKey);
    setStatusVersion((v) => v + 1);
  };

  const modalSnap = modalBatch ? getSellerDisplayForReception(modalBatch.sellerId) : null;
  const modalDateLabel = modalBatch ? formatDateKeyRu(modalBatch.dateKey) : '';
  const modalAlreadyAccepted =
    modalBatch != null && getReceptionBatchStatus(modalBatch.sellerId, modalBatch.dateKey) === 'accepted';

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
            <span>Дата партии</span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className={styles['warehouse-receiving-filter-control']}
            />
          </label>
          <label className={`${styles['warehouse-receiving-filter']} ${styles['warehouse-receiving-filter-grow']}`}>
            <span>Организация или логин</span>
            <input
              type="search"
              placeholder="Название организации, логин или id продавца"
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
                  <tr key={r.key}>
                    <td>
                      <div className={styles['warehouse-receiving-seller-cell']}>
                        <span className={styles['warehouse-receiving-seller-title']}>{r.snap.title}</span>
                        {r.snap.subtitle ? (
                          <span className={styles['warehouse-receiving-seller-sub']}>{r.snap.subtitle}</span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <span className={styles['warehouse-receiving-qty-main']}>{r.skuCount}</span>
                      <span className={styles['warehouse-receiving-qty-sub']}> позиций</span>
                    </td>
                    <td>{r.dateLabel}</td>
                    <td>
                      <span
                        className={`${styles['warehouse-receiving-status-badge']} ${
                          r.status === 'pending'
                            ? styles['warehouse-receiving-status-pending']
                            : styles['warehouse-receiving-status-accepted']
                        }`}
                      >
                        {r.status === 'pending' ? 'Ожидает приёмки' : 'Принято'}
                      </span>
                    </td>
                    <td className={styles['warehouse-receiving-col-action']}>
                      <button
                        type="button"
                        className={styles['warehouse-receiving-open-button']}
                        onClick={() => openModal(r.key)}
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

      {modalOpen && modalSnap && modalBatch && (
        <WindWarehouseReceiving
          isOpen={modalOpen}
          onClose={closeModal}
          onComplete={handleCompleteReception}
          sellerTitle={modalSnap.title}
          sellerSubtitle={modalSnap.subtitle}
          batchDateLabel={modalDateLabel}
          lines={modalLines}
          completeDisabled={modalAlreadyAccepted}
        />
      )}
    </div>
  );
};

export default WarehouseReceiving;
