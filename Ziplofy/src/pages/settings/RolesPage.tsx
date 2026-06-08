import React, { useEffect } from 'react';
import {
  ArrowsUpDownIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useStoreRoles } from '../../contexts/store-roles.context';
import { useStore } from '../../contexts/store.context';
import { SettingsHero, SettingsPanel } from '../../components/settings/SettingsPageScaffold';

type RoleRow = {
  id: string;
  name: string;
  users: number;
};

const RolesPage: React.FC = () => {
  const navigate = useNavigate();
  const { roles, loading, fetchByStoreId } = useStoreRoles();
  const { activeStoreId } = useStore();
  const rows: RoleRow[] = React.useMemo(
    () => roles.map((r) => ({ id: r._id, name: r.name, users: 0 })),
    [roles]
  );
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeStoreId) {
      fetchByStoreId(activeStoreId).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStoreId]);

  const toggleRow = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = () => {
    const allSelected = rows.every((r) => selected[r.id]);
    const next: Record<string, boolean> = {};
    rows.forEach((r) => {
      next[r.id] = !allSelected;
    });
    setSelected(next);
  };

  const selectedCount = rows.filter((r) => selected[r.id]).length;
  const isAllSelected = rows.length > 0 && selectedCount === rows.length;
  const isIndeterminate = rows.length > 0 && selectedCount > 0 && selectedCount < rows.length;

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Roles"
          description="Define permissions and assign roles to staff."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200/90 shadow-sm hover:bg-gray-50/90 transition-colors"
              >
                <ArrowUpTrayIcon className="w-4 h-4" />
                Export
              </button>
              <button
                type="button"
                onClick={() => navigate('/settings/users/roles/new')}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-blue-600 shadow-sm hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Add role
              </button>
            </div>
          }
        />

        <SettingsPanel className="overflow-hidden p-0">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
            <button
              type="button"
              className="rounded-lg px-3 py-1.5 text-xs font-medium bg-gray-900 text-white"
            >
              All
            </button>
            <div className="flex-1" />
            <button
              type="button"
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label="Sort"
            >
              <ArrowsUpDownIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="w-12 pl-5 pr-3 py-3 text-left">
                    <input
                      type="checkbox"
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = isIndeterminate;
                        }
                      }}
                      checked={isAllSelected}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
                      aria-label="Select all roles"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Users</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center">
                      <div className="inline-block w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
                      <p className="mt-3 text-sm text-gray-500">Loading roles...</p>
                    </td>
                  </tr>
                )}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center">
                      <p className="text-sm font-medium text-gray-900">No roles yet</p>
                      <p className="mt-1 text-sm text-gray-500">Create a role to manage permissions.</p>
                      <button
                        type="button"
                        onClick={() => navigate('/settings/users/roles/new')}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Add role
                      </button>
                    </td>
                  </tr>
                )}
                {!loading &&
                  rows.length > 0 &&
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                      onClick={() => navigate(`/settings/users/roles/${row.id}`)}
                    >
                      <td className="pl-5 pr-3 py-3">
                        <input
                          type="checkbox"
                          checked={Boolean(selected[row.id])}
                          onChange={() => toggleRow(row.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
                          aria-label={`Select role ${row.name}`}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-right">{row.users}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-sm text-gray-500 text-center">
              <button type="button" onClick={() => {}} className="text-gray-700 font-medium hover:underline">
                Learn more about roles
              </button>
            </p>
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
};

export default RolesPage;
