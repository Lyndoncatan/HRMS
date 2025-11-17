import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Profile, UserPermission } from '../lib/supabase';
import { Search, Shield, Ban, EyeOff, Eye } from 'lucide-react';
import UserModal from './UserModal';

interface ProfileWithPermissions extends Profile {
  permissions?: UserPermission;
}

export default function UsersPage() {
  const { profile: currentUserProfile } = useAuth();
  const [users, setUsers] = useState<ProfileWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<ProfileWithPermissions | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching users:', profilesError);
      setLoading(false);
      return;
    }

    const { data: permissionsData } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('super_admin_id', currentUserProfile?.id || '');

    const usersWithPermissions = (profilesData || []).map((user) => {
      const permission = permissionsData?.find((p) => p.target_user_id === user.id);
      return {
        ...user,
        permissions: permission,
      };
    });

    setUsers(usersWithPermissions);
    setLoading(false);
  };

  useEffect(() => {
    if (currentUserProfile?.role === 'super_admin') {
      fetchUsers();
    }
  }, [currentUserProfile]);

  const handleToggleBlock = async (user: ProfileWithPermissions) => {
    const newStatus = user.status === 'blocked' ? 'active' : 'blocked';

    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      alert('Error updating user status: ' + error.message);
    } else {
      fetchUsers();
    }
  };

  const handleToggleHidden = async (user: ProfileWithPermissions) => {
    const isHidden = user.permissions?.is_hidden || false;

    if (user.permissions) {
      const { error } = await supabase
        .from('user_permissions')
        .update({ is_hidden: !isHidden, updated_at: new Date().toISOString() })
        .eq('id', user.permissions.id);

      if (error) {
        alert('Error updating user visibility: ' + error.message);
      } else {
        fetchUsers();
      }
    } else {
      const { error } = await supabase
        .from('user_permissions')
        .insert({
          super_admin_id: currentUserProfile?.id,
          target_user_id: user.id,
          is_hidden: true,
          can_delete: true,
          can_block: true,
        });

      if (error) {
        alert('Error setting user visibility: ' + error.message);
      } else {
        fetchUsers();
      }
    }
  };

  const handleDelete = async (user: ProfileWithPermissions) => {
    if (!confirm(`Are you sure you want to delete user ${user.email}?`)) return;

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (error) {
      alert('Error deleting user: ' + error.message);
    } else {
      fetchUsers();
    }
  };

  const handleManageRights = (user: ProfileWithPermissions) => {
    setSelectedUser(user);
  };

  const filteredUsers = users.filter(
    (user) =>
      !user.permissions?.is_hidden &&
      (user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading users...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#174978' }}>User Management</h2>
          <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{ backgroundColor: '#174978' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium" style={{ color: '#174978' }}>
                          {user.full_name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : user.status === 'blocked'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleManageRights(user)}
                          className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                          style={{ color: '#174978' }}
                          title="Manage Rights"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleBlock(user)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.status === 'blocked'
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-orange-600 hover:bg-orange-50'
                          }`}
                          title={user.status === 'blocked' ? 'Unblock' : 'Block'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleHidden(user)}
                          className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                          style={{ color: '#174978' }}
                          title={user.permissions?.is_hidden ? 'Show' : 'Hide'}
                        >
                          {user.permissions?.is_hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => {
            setSelectedUser(null);
            fetchUsers();
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
