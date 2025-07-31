import React from 'react';
import LeadColumn from './LeadColumn';
import { Lead } from '../../services/leads';

interface PipelineData {
  pipeline: {
    new: Lead[];
    contacted: Lead[];
    under_contract: Lead[];
    closed: Lead[];
    lost: Lead[];
  };
  total: number;
  stats: {
    new: number;
    contacted: number;
    under_contract: number;
    closed: number;
    lost: number;
  };
}

interface LeadPipelineProps {
  pipelineData: PipelineData;
  onLeadMove: (leadId: string, newStatus: string) => void;
  users: any[];
}

const LeadPipeline: React.FC<LeadPipelineProps> = ({ 
  pipelineData, 
  onLeadMove, 
  users 
}) => {
  const columns = [
    {
      id: 'new',
      title: 'New',
      color: 'bg-blue-100',
      textColor: 'text-blue-800',
      leads: pipelineData?.pipeline?.new || [],
      count: pipelineData?.stats?.new || 0
    },
    {
      id: 'contacted',
      title: 'Contacted',
      color: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      leads: pipelineData?.pipeline?.contacted || [],
      count: pipelineData?.stats?.contacted || 0
    },
    {
      id: 'under_contract',
      title: 'Under Contract',
      color: 'bg-purple-100',
      textColor: 'text-purple-800',
      leads: pipelineData?.pipeline?.under_contract || [],
      count: pipelineData?.stats?.under_contract || 0
    },
    {
      id: 'closed',
      title: 'Closed',
      color: 'bg-green-100',
      textColor: 'text-green-800',
      leads: pipelineData?.pipeline?.closed || [],
      count: pipelineData?.stats?.closed || 0
    },
    {
      id: 'lost',
      title: 'Lost',
      color: 'bg-red-100',
      textColor: 'text-red-800',
      leads: pipelineData?.pipeline?.lost || [],
      count: pipelineData?.stats?.lost || 0
    }
  ];

  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-4 min-w-max">
        {columns.map((column) => (
          <LeadColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            textColor={column.textColor}
            leads={column.leads}
            count={column.count}
            onLeadMove={onLeadMove}
            users={users}
          />
        ))}
      </div>
    </div>
  );
};

export default LeadPipeline; 