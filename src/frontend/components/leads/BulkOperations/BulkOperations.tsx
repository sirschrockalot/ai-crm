import React, { useState, useEffect } from 'react';
import { Button, Card, Badge } from '../../ui';
import { Select, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, Alert } from '@chakra-ui/react';
import { Users, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import { useApi } from '../../../hooks/useApi';
import { useToast } from '@chakra-ui/react';

interface BulkOperation {
  leadIds: string[];
  operation: 'update_status' | 'assign' | 'delete';
  status?: string;
  assignedTo?: string;
  tags?: string[];
}

interface BulkOperationResult {
  operationId: string;
  operation: string;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: Array<{
    row: number;
    field: string;
    error: string;
    value: string;
  }>;
  completedAt: Date;
  resultFile?: string;
}

interface BulkOperationsProps {
  selectedLeadIds: string[];
  onOperationComplete?: () => void;
  onClose?: () => void;
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({
  selectedLeadIds,
  onOperationComplete,
  onClose
}) => {
  const toast = useToast();
  const [operation, setOperation] = useState<BulkOperation['operation']>('update_status');
  const [status, setStatus] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [operationResult, setOperationResult] = useState<BulkOperationResult | null>(null);
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [leadValidation, setLeadValidation] = useState<{
    validIds: string[];
    invalidIds: string[];
    totalValid: number;
    totalInvalid: number;
  } | null>(null);

  useEffect(() => {
    loadUsers();
    validateSelectedLeads();
  }, [selectedLeadIds]);

  const validateSelectedLeads = async () => {
    if (selectedLeadIds.length === 0) {
      setLeadValidation(null);
      return;
    }

    try {
      const response = await api.execute({ 
        method: 'POST', 
        url: '/leads/import-export/bulk-operation/validate', 
        data: { leadIds: selectedLeadIds } 
      });
      
      if (response.success) {
        setLeadValidation(response.data);
      } else {
        setLeadValidation(null);
      }
    } catch (error) {
      console.error('Failed to validate lead IDs:', error);
      setLeadValidation(null);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.execute({ 
        method: 'GET', 
        url: '/users' 
      });
      setUsers(response.data.map((user: any) => ({ id: user.id, name: user.name || user.email })));
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const api = useApi();

  const statusOptions = [
    { value: 'NEW', label: 'New' },
    { value: 'CONTACTED', label: 'Contacted' },
    { value: 'QUALIFIED', label: 'Qualified' },
    { value: 'INTERESTED', label: 'Interested' },
    { value: 'NEGOTIATING', label: 'Negotiating' },
    { value: 'CLOSED_WON', label: 'Closed Won' },
    { value: 'CLOSED_LOST', label: 'Closed Lost' }
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' }
  ];

  const executeBulkAssign = async () => {
    if (!assignedTo || selectedLeadIds.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select a team member and leads to assign',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsExecuting(true);
    try {
      const response = await api.execute({
        method: 'POST',
        url: '/leads/import-export/bulk-operation',
        data: {
          leadIds: selectedLeadIds,
          operation: 'assign',
          assignedTo,
        }
      });

      if (response.success) {
        setOperationResult(response.data);
        toast({
          title: 'Success',
          description: `Successfully assigned ${response.data.successfulRecords} leads`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        if (onOperationComplete) {
          onOperationComplete();
        }
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to assign leads',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to assign leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign leads',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const executeBulkDelete = async () => {
    if (selectedLeadIds.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select leads to delete',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsExecuting(true);
    try {
      const response = await api.execute({
        method: 'POST',
        url: '/leads/import-export/bulk-operation',
        data: {
          leadIds: selectedLeadIds,
          operation: 'delete',
        }
      });

      if (response.success) {
        setOperationResult(response.data);
        toast({
          title: 'Success',
          description: `Successfully deleted ${response.data.successfulRecords} leads`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        if (onOperationComplete) {
          onOperationComplete();
        }
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to delete leads',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to delete leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete leads',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getOperationTitle = (op: string) => {
    const titles: Record<string, string> = {
      'update_status': 'Bulk Status Update',
      'assign': 'Bulk Lead Assignment',
      'delete': 'Bulk Lead Deletion',
    };
    return titles[op] || 'Bulk Operation';
  };

  const getOperationDescription = (op: string) => {
    const descriptions: Record<string, string> = {
      'update_status': `Update status for ${selectedLeadIds.length} selected leads`,
      'assign': `Assign ${selectedLeadIds.length} selected leads to team member`,
      'delete': `Delete ${selectedLeadIds.length} selected leads (this action cannot be undone)`,
    };
    return descriptions[op] || 'Perform bulk operation on selected leads';
  };

  const getOperationIcon = (op: string) => {
    const icons: Record<string, React.ReactNode> = {
      'update_status': <Edit className="w-4 h-4" />,
      'assign': <Users className="w-4 h-4" />,
      'delete': <Trash2 className="w-4 h-4" />,
    };
    return icons[op] || <Edit className="w-4 h-4" />;
  };

  const isOperationValid = () => {
    switch (operation) {
      case 'update_status':
        return status && selectedLeadIds.length > 0;
      case 'assign':
        return assignedTo && selectedLeadIds.length > 0;
      case 'delete':
        return selectedLeadIds.length > 0;
      default:
        return false;
    }
  };

  const executeOperation = async () => {
    if (!isOperationValid()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsExecuting(true);
    try {
      const response = await api.execute({
        method: 'POST',
        url: '/leads/import-export/bulk-operation',
        data: {
          leadIds: selectedLeadIds,
          operation,
          status,
          assignedTo,
          tags,
        }
      });

      if (response.success) {
        setOperationResult(response.data);
        toast({
          title: 'Success',
          description: `Successfully processed ${response.data.successfulRecords} leads`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        if (onOperationComplete) {
          onOperationComplete();
        }
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to execute bulk operation',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to execute bulk operation:', error);
      toast({
        title: 'Error',
        description: 'Failed to execute bulk operation',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getResultIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getResultColor = (success: boolean) => {
    return success ? 'green' : 'red';
  };

  return (
    <div className="space-y-6">
      {/* Operation Selection */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Bulk Operations</h3>
          
          {/* Lead Validation Status */}
          {leadValidation && (
            <div className="mb-4 p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Lead Validation</span>
                <Badge color={leadValidation.totalInvalid === 0 ? 'green' : 'yellow'}>
                  {leadValidation.totalInvalid === 0 ? 'All Valid' : `${leadValidation.totalInvalid} Invalid`}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-600 font-medium">Valid IDs:</span> {leadValidation.totalValid}
                </div>
                <div>
                  <span className="text-red-600 font-medium">Invalid IDs:</span> {leadValidation.totalInvalid}
                </div>
              </div>
              {leadValidation.totalInvalid > 0 && (
                <div className="mt-2 text-xs text-red-600">
                  Warning: {leadValidation.totalInvalid} lead IDs are invalid and will be skipped
                </div>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {(['update_status', 'assign', 'delete'] as const).map((op) => (
              <div
                key={op}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  operation === op
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setOperation(op)}
              >
                <div className="flex items-center space-x-3">
                  {getOperationIcon(op)}
                  <div>
                    <div className="font-medium text-gray-900">{getOperationTitle(op)}</div>
                    <div className="text-sm text-gray-500">{getOperationDescription(op)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Operation Configuration */}
          <div className="space-y-4">
            {operation === 'update_status' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder="Select new status..."
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {operation === 'assign' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To
                </label>
                <Select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Select team member..."
                >
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {operation === 'delete' && (
              <Alert color="red">
                <div className="flex items-center space-x-2">
                  <Trash2 className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Warning: This action cannot be undone</div>
                    <div className="text-sm">
                      You are about to delete {selectedLeadIds.length} leads. This action will permanently remove these leads from the system.
                    </div>
                  </div>
                </div>
              </Alert>
            )}
          </div>

          <div className="mt-6 flex gap-2">
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={!isOperationValid() || isExecuting}
              color={operation === 'delete' ? 'red' : 'blue'}
              isLoading={isExecuting}
            >
              {getOperationTitle(operation)}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isExecuting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>

      {/* Operation Result */}
      {operationResult && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Operation Complete</h3>
              <div className="flex items-center space-x-2">
                {getResultIcon(operationResult.successfulRecords > 0)}
                <Badge color={getResultColor(operationResult.successfulRecords > 0)}>
                  {operationResult.successfulRecords > 0 ? 'Success' : 'Failed'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{operationResult.totalRecords}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{operationResult.successfulRecords}</div>
                <div className="text-sm text-gray-500">Success</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{operationResult.failedRecords}</div>
                <div className="text-sm text-gray-500">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((operationResult.successfulRecords / operationResult.totalRecords) * 100)}%
                </div>
                <div className="text-sm text-gray-500">Success Rate</div>
              </div>
            </div>

            {operationResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-red-600 mb-2">Errors</h4>
                <div className="max-h-40 overflow-y-auto">
                  {operationResult.errors.slice(0, 10).map((error, index) => (
                    <div key={index} className="text-sm text-red-600 mb-1">
                      Row {error.row}: {error.field} - {error.error}
                    </div>
                  ))}
                  {operationResult.errors.length > 10 && (
                    <div className="text-sm text-gray-500">
                      ... and {operationResult.errors.length - 10} more errors
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-500">
              Completed at: {new Date(operationResult.completedAt).toLocaleString()}
            </div>
          </div>
        </Card>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Confirm {getOperationTitle(operation)}
          </ModalHeader>
          <ModalBody>
            <div className="mb-4">
              <p className="text-gray-600">
                Are you sure you want to {operation.replace('_', ' ')} {selectedLeadIds.length} selected leads?
              </p>
              {operation === 'delete' && (
                <p className="text-red-600 font-medium mt-2">
                  This action cannot be undone!
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={executeOperation}
                isLoading={isExecuting}
                colorScheme={operation === 'delete' ? 'red' : 'blue'}
              >
                Confirm
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={isExecuting}
              >
                Cancel
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};
