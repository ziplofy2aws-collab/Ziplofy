import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal';
import { SettingsHero, SettingsPanel } from '../../components/settings/SettingsPageScaffold';
import { axiosi } from '../../config/axios.config';
import { useStore } from '../../contexts/store.context';
import { useStoreRoles } from '../../contexts/store-roles.context';

type StoreUserRow = {
  _id: string;
  email: string;
  name?: string;
  status: 'active' | 'inactive' | 'pending';
  role: string;
  roleId?: string;
  type: 'owner' | 'invite';
};

type ListUsersResponse = {
  success: boolean;
  data: StoreUserRow[];
  message?: string;
};

type CreateInviteResponse = {
  success: boolean;
  data: StoreUserRow;
  message?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UsersPage: React.FC = () => {
  const { activeStoreId } = useStore();
  const { roles, fetchByStoreId } = useStoreRoles();
  const [users, setUsers] = useState<StoreUserRow[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    if (!activeStoreId) {
      setUsers([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ListUsersResponse>('/store-invites', {
        params: { storeId: activeStoreId },
      });
      if (!res.data.success) throw new Error(res.data.message || 'Failed to load users');
      setUsers(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
        (err as { message?: string })?.message ||
        'Failed to load users';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeStoreId]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!activeStoreId) return;
    fetchByStoreId(activeStoreId).catch(() => {});
  }, [activeStoreId, fetchByStoreId]);

  useEffect(() => {
    if (!addOpen) return;
    if (!inviteRoleId && roles.length > 0) {
      setInviteRoleId(roles[0]._id);
    }
  }, [addOpen, inviteRoleId, roles]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedUsers(new Set(users.map((u) => u._id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const isAllSelected = users.length > 0 && selectedUsers.size === users.length;
  const isIndeterminate = selectedUsers.size > 0 && selectedUsers.size < users.length;

  const openAddUsers = () => {
    setInviteEmail('');
    setInviteError(null);
    setInviteRoleId(roles[0]?._id || '');
    setAddOpen(true);
  };

  const closeAddUsers = () => {
    if (submitting) return;
    setAddOpen(false);
    setInviteError(null);
  };

  const canSubmitInvite = useMemo(() => {
    return EMAIL_RE.test(inviteEmail.trim()) && Boolean(inviteRoleId) && Boolean(activeStoreId);
  }, [activeStoreId, inviteEmail, inviteRoleId]);

  const handleSendInvite = async () => {
    if (!activeStoreId) {
      setInviteError('Select a store first');
      return;
    }
    const email = inviteEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      setInviteError('Enter a valid email address');
      return;
    }
    if (!inviteRoleId) {
      setInviteError('Select a role');
      return;
    }

    try {
      setSubmitting(true);
      setInviteError(null);
      const res = await axiosi.post<CreateInviteResponse>('/store-invites', {
        storeId: activeStoreId,
        email,
        roleId: inviteRoleId,
      });
      if (!res.data.success) throw new Error(res.data.message || 'Failed to send invite');

      setUsers((prev) => {
        const withoutDuplicate = prev.filter(
          (user) => !(user.type === 'invite' && user.email.toLowerCase() === email)
        );
        return [...withoutDuplicate, res.data.data];
      });
      toast.success('Invite sent');
      setAddOpen(false);
      setInviteEmail('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
        (err as { message?: string })?.message ||
        'Failed to send invite';
      setInviteError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
        <SettingsHero
          title="Users"
          description="Manage staff accounts, roles, and permissions."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-gray-200/90 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50/90"
              >
                Export
              </button>
              <button
                type="button"
                onClick={openAddUsers}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                Add users
              </button>
            </div>
          }
        />

        <SettingsPanel className="overflow-hidden p-0">
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center px-6 py-10">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            </div>
          ) : error ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center px-6 py-10 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                type="button"
                onClick={() => void loadUsers()}
                className="mt-3 text-sm font-medium text-gray-900 hover:underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    <th className="w-12 py-3 pl-5 pr-3 text-left">
                      <input
                        type="checkbox"
                        ref={(input) => {
                          if (input) input.indeterminate = isIndeterminate;
                        }}
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-500">
                        No users yet. Click Add users to invite staff.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="transition-colors hover:bg-gray-50/80">
                        <td className="py-3 pl-5 pr-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user._id)}
                            onChange={() => handleSelectUser(user._id)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <p className="max-w-[300px] truncate text-sm font-medium text-gray-900">
                            {user.email}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              user.status === 'active'
                                ? 'bg-green-50 text-green-700'
                                : user.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <ShieldCheckIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{user.role}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </SettingsPanel>

        <p className="text-sm text-gray-500">
          <button type="button" onClick={() => {}} className="font-medium text-gray-700 hover:underline">
            Learn more about users
          </button>
        </p>
      </div>

      <Modal open={addOpen} onClose={closeAddUsers} title="Add users" maxWidth="md">
        <div className="space-y-4 px-1 py-1">
          <p className="text-sm text-gray-600">
            Invite a staff member by email and assign a store role.
          </p>

          <div>
            <label htmlFor="invite-email" className="mb-1.5 block text-sm font-medium text-gray-800">
              Email
            </label>
            <input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(event) => {
                setInviteEmail(event.target.value);
                if (inviteError) setInviteError(null);
              }}
              placeholder="colleague@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label htmlFor="invite-role" className="mb-1.5 block text-sm font-medium text-gray-800">
              Role
            </label>
            {roles.length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                No roles found.{' '}
                <Link to="/settings/users/roles/new" className="font-medium underline">
                  Create a role
                </Link>{' '}
                first, then invite users.
              </div>
            ) : (
              <select
                id="invite-role"
                value={inviteRoleId}
                onChange={(event) => setInviteRoleId(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-900"
              >
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {inviteError ? <p className="text-sm text-red-600">{inviteError}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeAddUsers}
              disabled={submitting}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSendInvite()}
              disabled={!canSubmitInvite || submitting || roles.length === 0}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Sending…' : 'Send invite'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
