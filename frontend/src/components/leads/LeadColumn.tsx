import React from 'react';
import LeadCard from './LeadCard';
import { Lead } from '../../services/leads';

interface LeadColumnProps {
  id: string;
  title: string;
  color: string;
  textColor: string;
  leads: Lead[];
  count: number;
  onLeadMove: (leadId: string, newStatus: string) => void;
  users: any[];
}

const LeadColumn: React.FC<LeadColumnProps> = ({
  id,
  title,
  color,
  textColor,
  leads,
  count,
  onLeadMove,
  users
}) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    const leadStatus = e.dataTransfer.getData('application/lead-status');
    
    if (leadStatus !== id) {
      onLeadMove(leadId, id);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Column Header */}
        <div className={`px-4 py-3 border-b border-gray-200 ${color}`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${textColor}`}>{title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${color} ${textColor}`}>
              {count}
            </span>
          </div>
        </div>

        {/* Column Content */}
        <div
          className="p-4 min-h-[600px]"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="space-y-3">
            {leads.map((lead) => (
              <LeadCard
                key={lead._id}
                lead={lead}
                users={users}
                currentStatus={id}
              />
            ))}
            
            {leads.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No leads in this stage</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadColumn; 