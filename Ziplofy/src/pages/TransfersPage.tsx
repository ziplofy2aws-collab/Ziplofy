import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TransfersPageHeader from '../components/TransfersPageHeader';
import { useStore } from '../contexts/store.context';
import { useTransfers } from '../contexts/transfer.context';

const TransfersPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchTransfersByStoreId, transfers, loading } = useTransfers();
  const { activeStoreId } = useStore();

  useEffect(() => {
    if (activeStoreId) {
      fetchTransfersByStoreId(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, fetchTransfersByStoreId]);

  const handleRowClick = useCallback((transferId: string) => {
    navigate(`/products/transfers/${transferId}`);
  }, [navigate]);

  const handleCreateTransfer = useCallback(() => {
    navigate('/products/transfers/new');
  }, [navigate]);

  const getStatusStyles = useCallback((status: string) => {
    switch (status) {
      case 'transferred':
        return 'bg-green-50 text-green-700 border-green-200/80';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'ready_to_ship':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200/80';
    }
  }, []);

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        <TransfersPageHeader onCreateTransfer={handleCreateTransfer} />

        {loading && (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-blue-600"></div>
          </div>
        )}

        {!loading && transfers.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm min-h-[320px] flex justify-center items-center p-12">
            <div className="flex flex-col justify-center items-center text-center gap-4 max-w-md">
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
                <ArrowPathIcon className="w-7 h-7 text-blue-600" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-semibold text-gray-900">No transfers yet</h2>
                <p className="text-sm text-gray-500">
                  Start by creating your first transfer to move products between locations and keep your inventory organized.
                </p>
              </div>
              <button
                onClick={handleCreateTransfer}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold transition-colors shadow-sm"
              >
                <PlusIcon className="w-4 h-4" />
                Create Transfer
              </button>
            </div>
          </div>
        )}

        {!loading && transfers.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Transfer ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Origin</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Destination</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Transfer Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Tags</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Updated</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {transfers.map((t) => (
                    <tr
                      key={t._id}
                      onClick={() => handleRowClick(t._id)}
                      className="cursor-pointer hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 font-mono text-sm">
                        #{t._id.slice(-8)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{t.referenceName || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{t.originLocationId?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{t.destinationLocationId?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {t.transferDate ? new Date(t.transferDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {t.tags && t.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {t.tags.slice(0, 2).map(tag => (
                              <span
                                key={tag._id}
                                className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60"
                              >
                                {tag.name}
                              </span>
                            ))}
                            {t.tags.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-600">
                                +{t.tags.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">No tags</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg border capitalize ${getStatusStyles(t.status)}`}>
                          {t.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransfersPage;
