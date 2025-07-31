import React from 'react';
import { Lead } from '../../services/leads';

interface LeadCardProps {
  lead: Lead;
  users: any[];
  currentStatus: string;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, users, currentStatus }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', lead._id);
    e.dataTransfer.setData('application/lead-status', currentStatus);
    e.dataTransfer.effectAllowed = 'move';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAssignedUserName = (assignedTo?: string) => {
    if (!assignedTo) return 'Unassigned';
    const user = users.find(u => u._id === assignedTo);
    return user ? user.name : 'Unknown';
  };

  const formatPhone = (phone: string) => {
    // Simple phone formatting
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-move"
      draggable
      onDragStart={handleDragStart}
    >
      {/* Lead Name and Priority */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 truncate flex-1">
          {lead.name}
        </h4>
        <div className={`w-3 h-3 rounded-full ${getPriorityColor(lead.priority)} ml-2`} />
      </div>

      {/* Contact Information */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {formatPhone(lead.phone)}
        </div>
        
        {lead.email && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {lead.email}
          </div>
        )}
      </div>

      {/* Property Details */}
      {lead.property_details && (
        <div className="mb-3">
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {lead.property_details.type && (
              <span className="capitalize">{lead.property_details.type.replace('_', ' ')}</span>
            )}
            {lead.property_details.bedrooms && lead.property_details.bathrooms && (
              <span className="ml-2">
                {lead.property_details.bedrooms}bd, {lead.property_details.bathrooms}ba
              </span>
            )}
          </div>
        </div>
      )}

      {/* Financial Information */}
      {(lead.estimated_value || lead.asking_price) && (
        <div className="mb-3">
          <div className="text-sm text-gray-600">
            {lead.estimated_value && (
              <div className="flex items-center">
                <span className="font-medium">Est. Value:</span>
                <span className="ml-1 text-green-600">{formatCurrency(lead.estimated_value)}</span>
              </div>
            )}
            {lead.asking_price && (
              <div className="flex items-center">
                <span className="font-medium">Asking:</span>
                <span className="ml-1 text-blue-600">{formatCurrency(lead.asking_price)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assignment */}
      <div className="mb-3">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {getAssignedUserName(lead.assigned_to)}
        </div>
      </div>

      {/* Tags */}
      {lead.tags && lead.tags.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {lead.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {lead.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{lead.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Communication Count */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {lead.communication_count} contact{lead.communication_count !== 1 ? 's' : ''}
        </span>
        <span>
          {lead.created_at && new Date(lead.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default LeadCard; 