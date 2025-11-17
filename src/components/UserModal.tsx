import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Profile, UserPermission } from '../lib/supabase';
import { X, Trash2 } from 'lucide-react';

interface UserModalProps {
  user: Profile & { permissions?: UserPermission };
  onClose: () => void;
  onDelete: (user: Profile) => void;
}

export default function UserModal({ user, onClose, onDelete }: UserModalProps) {
  const { profile: currentUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    can_delete: true,
    can_block: true,
    is_hidden: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user.permissions) {
      setFormData({
        can_delete: user.permissions.can_delete,
        can_block: user.permissions.can_block,
        is_hidden: user.permissions.is_hidden,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (user.permissions) {
        const { error: updateError } = await supabase
          .from('user_permissions')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.permissions.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_permissions')
          .insert({
            super_admin_id: currentUserProfile?.id,
            target_user_id: user.id,
            ...formData,
          });

        if (insertError) throw insertError;
      }

      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = () => {
    if (!formData.can_delete) {
      alert('Delete permission is disabled for this user');
      return;
    }
    onDelete(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: '#e5e7eb' }}>
          <h3 className="text-xl font-semibold" style={{ color: '#174978' }}>
            Manage User Rights
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-4 border-b bg-gray-50">
          <div>
            <div className="font-medium" style={{ color: '#174978' }}>
              {user.full_name || 'No name'}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
            <div className="mt-1">
              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.can_delete}
                onChange={(e) => setFormData({ ...formData, can_delete: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-opacity-50"
                style={{ accentColor: '#ffcc00' }}
              />
              <div>
                <div className="font-medium text-gray-900">Allow Delete</div>
                <div className="text-sm text-gray-500">Permission to delete this user account</div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.can_block}
                onChange={(e) => setFormData({ ...formData, can_block: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-opacity-50"
                style={{ accentColor: '#ffcc00' }}
              />
              <div>
                <div className="font-medium text-gray-900">Allow Block</div>
                <div className="text-sm text-gray-500">Permission to block/unblock this user</div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_hidden}
                onChange={(e) => setFormData({ ...formData, is_hidden: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-opacity-50"
                style={{ accentColor: '#ffcc00' }}
              />
              <div>
                <div className="font-medium text-gray-900">Hide User</div>
                <div className="text-sm text-gray-500">Hide this user from the user list</div>
              </div>
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#ffcc00', color: '#174978' }}
            >
              {loading ? 'Saving...' : 'Save Rights'}
            </button>
          </div>
        </form>

        <div className="px-6 py-4 border-t bg-gray-50">
          <button
            onClick={handleDeleteUser}
            disabled={!formData.can_delete}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Delete User Account
          </button>
        </div>
      </div>
    </div>
  );
}
