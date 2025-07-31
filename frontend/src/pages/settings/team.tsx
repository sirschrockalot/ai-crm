import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import UserList from '../../components/users/UserList';
import UserForm from '../../components/users/UserForm';
import { useAuthStore } from '../../stores/authStore';
import { useUserStore } from '../../stores/userStore';

const TeamPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { users, fetchUsers, loading } = useUserStore();
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (user) {
      fetchUsers();
    }
  }, [user, router, fetchUsers]);

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleFormClose = () => {
    setShowUserForm(false);
    setEditingUser(null);
  };

  const handleFormSubmit = async (userData) => {
    try {
      if (editingUser) {
        await useUserStore.getState().updateUser(editingUser._id, userData);
      } else {
        await useUserStore.getState().createUser(userData);
      }
      setShowUserForm(false);
      setEditingUser(null);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
              <p className="mt-2 text-gray-600">
                Manage your team members and their permissions
              </p>
            </div>
            <button
              onClick={handleCreateUser}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Add Team Member
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <UserList 
            users={users} 
            onEditUser={handleEditUser}
            onActivateUser={(userId) => useUserStore.getState().activateUser(userId)}
            onDeactivateUser={(userId) => useUserStore.getState().deactivateUser(userId)}
            onDeleteUser={(userId) => useUserStore.getState().deleteUser(userId)}
          />
        )}

        {showUserForm && (
          <UserForm
            user={editingUser}
            onSubmit={handleFormSubmit}
            onClose={handleFormClose}
          />
        )}
      </div>
    </div>
  );
};

export default TeamPage; 