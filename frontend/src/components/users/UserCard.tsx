import React from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  avatar_url?: string;
  last_login?: Date;
  created_at: Date;
}

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onActivate?: (userId: string) => void;
  onDeactivate?: (userId: string) => void;
  onDelete?: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {user.avatar_url ? (
            <img
              className="h-12 w-12 rounded-full"
              src={user.avatar_url}
              alt={user.name}
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name}
            </p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
              {getRoleDisplayName(user.role)}
            </span>
            {!user.is_active && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Inactive
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
          <div className="mt-1 flex items-center text-xs text-gray-400">
            <span>Member since {formatDate(user.created_at)}</span>
            {user.last_login && (
              <>
                <span className="mx-2">•</span>
                <span>Last login {formatDate(user.last_login)}</span>
              </>
            )}
          </div>
        </div>

        {onEdit || onActivate || onDeactivate || onDelete ? (
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(user)}
                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
              >
                Edit
              </button>
            )}
            {user.is_active ? (
              onDeactivate && (
                <button
                  onClick={() => onDeactivate(user._id)}
                  className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
                >
                  Deactivate
                </button>
              )
            ) : (
              onActivate && (
                <button
                  onClick={() => onActivate(user._id)}
                  className="text-green-600 hover:text-green-900 text-sm font-medium"
                >
                  Activate
                </button>
              )
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(user._id)}
                className="text-red-600 hover:text-red-900 text-sm font-medium"
              >
                Delete
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default UserCard; 