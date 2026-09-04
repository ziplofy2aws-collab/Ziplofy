import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../contexts/permissions.context';
import { useStoreRoles } from '../../contexts/store-roles.context';
import { useStore } from '../../contexts/store.context';
import { useNavigate } from 'react-router-dom';
import PermissionPicker from '../../components/settings/PermissionPicker';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';
import { buildPermissionTree, collectLeafKeys } from '../../utils/permission-tree.util';

const NewRolePage: React.FC = () => {
  const { permissions, loading, error, fetchAll } = usePermissions();
  const { create } = useStoreRoles();
  const { activeStoreId } = useStore();
  const navigate = useNavigate();
  const [selectedLeafKeys, setSelectedLeafKeys] = useState<Set<string>>(new Set());
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  const allLeafKeys = useMemo(
    () => collectLeafKeys(buildPermissionTree(permissions)),
    [permissions]
  );

  useEffect(() => {
    setSelectedLeafKeys((prev) => {
      const next = new Set<string>();
      prev.forEach((key) => {
        if (allLeafKeys.includes(key)) next.add(key);
      });
      return next;
    });
  }, [allLeafKeys]);

  const canSave =
    roleName.trim().length > 0 &&
    selectedLeafKeys.size > 0 &&
    Boolean(activeStoreId);

  const handleSave = async () => {
    if (!canSave || !activeStoreId) return;
    try {
      setSaving(true);
      await create({
        storeId: activeStoreId,
        name: roleName.trim(),
        description: roleDescription.trim(),
        permissions: Array.from(selectedLeafKeys),
      });
      navigate('/settings/users/roles');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-[1000px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Create role"
          description="Name the role and pick the permissions staff should have."
          leading={
            <button
              type="button"
              onClick={() => navigate('/settings/users/roles')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200/90 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50/90 transition-colors"
              aria-label="Back to roles"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          }
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/settings/users/roles')}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200/90 shadow-sm hover:bg-gray-50/90 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave || saving}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-blue-600 shadow-sm hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          }
        />

        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900">Role details</h2>
          <p className="mt-1 text-sm text-gray-500">
            This name will appear when assigning roles to staff.
          </p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                placeholder="e.g. Support agent"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="What can this role do?"
                rows={2}
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Permissions</h2>
              <p className="mt-1 text-sm text-gray-500">
                Choose what this role can view and manage across Ziplofy.
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Selected <span className="font-medium text-gray-900">{selectedLeafKeys.size}</span>
              {allLeafKeys.length > 0 ? (
                <>
                  {' '}
                  of <span className="font-medium text-gray-900">{allLeafKeys.length}</span>
                </>
              ) : null}
            </div>
          </div>

          <div className="mt-4">
            <PermissionPicker
              permissions={permissions}
              loading={loading}
              error={error}
              selectedLeafKeys={selectedLeafKeys}
              onChange={setSelectedLeafKeys}
              onRetry={() => fetchAll().catch(() => {})}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRolePage;
