import React, { useState } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { SettingsHero, SettingsPanel } from '../../components/settings/SettingsPageScaffold';

interface User {
  _id: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  role: string;
}

const UsersPage: React.FC = () => {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Mock data - replace with actual data fetching
  const users: User[] = [
    {
      _id: '1',
      email: 'developer200419@gmail.com',
      status: 'active',
      role: 'Store owner',
    },
  ];

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
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const isAllSelected = users.length > 0 && selectedUsers.size === users.length;
  const isIndeterminate = selectedUsers.size > 0 && selectedUsers.size < users.length;

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Users"
          description="Manage staff accounts, roles, and permissions."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200/90 hover:bg-gray-50/90 transition-colors shadow-sm"
              >
                Export
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              >
                Add users
              </button>
            </div>
          }
        />

        <SettingsPanel className="overflow-hidden p-0">
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
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="pl-5 pr-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[300px]">
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
                        <ShieldCheckIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{user.role}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsPanel>

        <p className="text-sm text-gray-500">
          <button
            type="button"
            onClick={() => {}}
            className="text-gray-700 font-medium hover:underline"
          >
            Learn more about users
          </button>
        </p>
      </div>
    </div>
  );
};

export default UsersPage;
