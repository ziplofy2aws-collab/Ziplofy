import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TransfersPageFilters, { type TransferFilterTab } from '../components/transfers/TransfersPageFilters';
import TransfersPageHeader from '../components/transfers/TransfersPageHeader';
import TransfersTable from '../components/transfers/TransfersTable';
import { transferPrimaryButtonClass } from '../components/transfers/transfer-ui.util';
import { useStore } from '../contexts/store.context';
import { useTransfers } from '../contexts/transfer.context';

const TransfersPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchTransfersByStoreId, transfers, loading } = useTransfers();
  const { activeStoreId } = useStore();
  const [activeTab, setActiveTab] = useState<TransferFilterTab>('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (activeStoreId) {
      fetchTransfersByStoreId(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, fetchTransfersByStoreId]);

  const handleRowClick = useCallback(
    (transferId: string) => {
      navigate(`/products/transfers/${transferId}`);
    },
    [navigate]
  );

  const handleCreateTransfer = useCallback(() => {
    navigate('/products/transfers/new');
  }, [navigate]);

  const filteredTransfers = useMemo(() => {
    const list = transfers || [];
    const byTab = list.filter((transfer) => {
      if (activeTab === 'All') return true;
      if (activeTab === 'Draft') return transfer.status === 'draft';
      if (activeTab === 'In progress') {
        return transfer.status === 'in_progress' || transfer.status === 'ready_to_ship';
      }
      return transfer.status === 'transferred';
    });

    const query = search.trim().toLowerCase();
    if (!query) return byTab;

    return byTab.filter((transfer) => {
      return (
        transfer._id.toLowerCase().includes(query) ||
        (transfer.referenceName || '').toLowerCase().includes(query) ||
        (transfer.originLocationId?.name || '').toLowerCase().includes(query) ||
        (transfer.destinationLocationId?.name || '').toLowerCase().includes(query) ||
        transfer.status.toLowerCase().includes(query) ||
        (transfer.tags || []).some((tag) => tag.name.toLowerCase().includes(query))
      );
    });
  }, [transfers, activeTab, search]);

  const hasTransfers = (transfers || []).length > 0;

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[1200px]">
        <TransfersPageHeader />

        <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
          <TransfersPageFilters
            activeTab={activeTab}
            onTabChange={setActiveTab}
            search={search}
            onSearchChange={setSearch}
          />

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center bg-admin-surface py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-admin-border border-t-admin-text" />
            </div>
          ) : !hasTransfers ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center bg-admin-surface px-6 py-16 text-center">
              <p className="text-[15px] font-semibold text-admin-text">Create your first transfer</p>
              <p className="mt-1.5 text-[13px] font-normal text-admin-text-secondary">
                Move products between locations and keep inventory organized
              </p>
              <button type="button" onClick={handleCreateTransfer} className={`mt-4 ${transferPrimaryButtonClass}`}>
                Create transfer
              </button>
            </div>
          ) : (
            <TransfersTable transfers={filteredTransfers} onRowClick={handleRowClick} />
          )}
        </div>

        <div className="py-5 text-center">
          <p className="text-xs text-admin-text-secondary">
            <a href="#" className="text-[#005bd3] hover:underline">
              Learn more about transfers
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransfersPage;
