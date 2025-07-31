import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useLeadStore } from '../../stores/leadStore';
import { useUserStore } from '../../stores/userStore';
import LeadPipeline from '../../components/leads/LeadPipeline';
import LeadFilters from '../../components/leads/LeadFilters';

const PipelinePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { 
    fetchPipelineData, 
    pipelineData, 
    loading, 
    error,
    moveLeadInPipeline 
  } = useLeadStore();
  const { users, fetchUsers } = useUserStore();
  const [filters, setFilters] = useState({
    assigned_to: '',
    source: '',
    tags: [] as string[],
    search: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchPipelineData(filters);
    }
  }, [isAuthenticated, fetchUsers, fetchPipelineData, filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleLeadMove = async (leadId: string, newStatus: string) => {
    try {
      await moveLeadInPipeline(leadId, newStatus);
      // Refresh pipeline data after move
      fetchPipelineData(filters);
    } catch (error) {
      console.error('Error moving lead:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
          <p className="text-gray-600">You need to be logged in to view the pipeline.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lead Pipeline</h1>
          <p className="mt-2 text-gray-600">
            Manage and track your leads through the sales process
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <LeadFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            users={users}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Pipeline */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg text-gray-600">Loading pipeline...</span>
            </div>
          </div>
        ) : (
          <LeadPipeline
            pipelineData={pipelineData}
            onLeadMove={handleLeadMove}
            users={users}
          />
        )}
      </div>
    </div>
  );
};

export default PipelinePage; 