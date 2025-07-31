import React from 'react';
import UserCard from './UserCard';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login?: Date;
  avatar_url?: string;
  created_at: Date;
}

interface UserListProps {
  users: User[];
  onEditUser: (user: User) => void;
  onActivateUser: (userId: string) => void;
  onDeactivateUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  onEditUser,
  onActivateUser,
  onDeactivateUser,
  onDeleteUser,
}) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'acquisition_rep':
        return 'bg-blue-100 text-blue-800';
      case 'disposition_manager':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'acquisition_rep':
        return 'Acquisition Rep';
      case 'disposition_manager':
        return 'Disposition Manager';
      default:
        return role;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No team members</h3>
        <p className="text-gray-500">Get started by adding your first team member.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {users.map((user) => (
          <li key={user._id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {user.avatar_url ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user.avatar_url}
                        alt={user.name}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                      {!user.is_active && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span>Member since {formatDate(user.created_at)}</span>
                      {user.last_login && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Last login {formatDate(user.last_login)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEditUser(user)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Edit
                  </button>
                  {user.is_active ? (
                    <button
                      onClick={() => onDeactivateUser(user._id)}
                      className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => onActivateUser(user._id)}
                      className="text-green-600 hover:text-green-900 text-sm font-medium"
                    >
                      Activate
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteUser(user._id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList; 