// ActionConfigurator Component
// Configuration interface for workflow actions

import React, { useState, useEffect } from 'react';
import { ActionConfiguratorProps, Action } from '../types/automation';

export const ActionConfigurator: React.FC<ActionConfiguratorProps> = ({
  action,
  availableActions,
  onActionChange,
  className = '',
}) => {
  const [selectedAction, setSelectedAction] = useState(action);
  const [config, setConfig] = useState(action.config);
  const [isValid, setIsValid] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  // Update action when props change
  useEffect(() => {
    setSelectedAction(action);
    setConfig(action.config);
  }, [action]);

  // Validate configuration
  useEffect(() => {
    const newErrors: string[] = [];
    
    if (!selectedAction.name.trim()) {
      newErrors.push('Action name is required');
    }
    
    if (!selectedAction.type) {
      newErrors.push('Action type is required');
    }
    
    // Validate based on action type
    switch (selectedAction.type) {
      case 'send_email':
        if (!config.toEmail) {
          newErrors.push('Recipient email is required');
        }
        if (!config.subject) {
          newErrors.push('Email subject is required');
        }
        break;
      case 'send_sms':
        if (!config.toPhone) {
          newErrors.push('Recipient phone number is required');
        }
        if (!config.message) {
          newErrors.push('SMS message is required');
        }
        break;
      case 'update_lead':
        if (!config.fieldName) {
          newErrors.push('Field name is required');
        }
        break;
      case 'create_task':
        if (!config.taskTitle) {
          newErrors.push('Task title is required');
        }
        break;
      case 'api_call':
        if (!config.apiUrl) {
          newErrors.push('API URL is required');
        }
        break;
      case 'webhook':
        if (!config.webhookUrl) {
          newErrors.push('Webhook URL is required');
        }
        break;
    }
    
    setErrors(newErrors);
    setIsValid(newErrors.length === 0);
  }, [selectedAction, config]);

  // Handle action type change
  const handleActionTypeChange = (type: string) => {
    const newAction = {
      ...selectedAction,
      type: type as any,
      config: {},
    };
    setSelectedAction(newAction);
    setConfig({});
    onActionChange(newAction);
  };

  // Handle config change
  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    
    const updatedAction = {
      ...selectedAction,
      config: newConfig,
    };
    setSelectedAction(updatedAction);
    onActionChange(updatedAction);
  };

  // Handle name change
  const handleNameChange = (name: string) => {
    const updatedAction = {
      ...selectedAction,
      name,
    };
    setSelectedAction(updatedAction);
    onActionChange(updatedAction);
  };

  // Handle description change
  const handleDescriptionChange = (description: string) => {
    const updatedAction = {
      ...selectedAction,
      description,
    };
    setSelectedAction(updatedAction);
    onActionChange(updatedAction);
  };

  // Handle enabled/disabled toggle
  const handleEnabledChange = (isEnabled: boolean) => {
    const updatedAction = {
      ...selectedAction,
      isEnabled,
    };
    setSelectedAction(updatedAction);
    onActionChange(updatedAction);
  };

  // Handle retry configuration
  const handleRetryConfigChange = (key: string, value: number) => {
    const retryConfig = {
      ...selectedAction.retryConfig,
      [key]: value,
    };
    const updatedAction = {
      ...selectedAction,
      retryConfig,
    };
    setSelectedAction(updatedAction);
    onActionChange(updatedAction);
  };

  // Render configuration form based on action type
  const renderConfigForm = () => {
    switch (selectedAction.type) {
      case 'send_email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Email
              </label>
              <input
                type="email"
                value={config.toEmail || ''}
                onChange={(e) => handleConfigChange('toEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter recipient email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={config.subject || ''}
                onChange={(e) => handleConfigChange('subject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message Template
              </label>
              <textarea
                value={config.messageTemplate || ''}
                onChange={(e) => handleConfigChange('messageTemplate', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email message template"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Email
              </label>
              <input
                type="email"
                value={config.fromEmail || ''}
                onChange={(e) => handleConfigChange('fromEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter sender email (optional)"
              />
            </div>
          </div>
        );

      case 'send_sms':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Phone Number
              </label>
              <input
                type="tel"
                value={config.toPhone || ''}
                onChange={(e) => handleConfigChange('toPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter recipient phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message Template
              </label>
              <textarea
                value={config.message || ''}
                onChange={(e) => handleConfigChange('message', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter SMS message template"
              />
            </div>
          </div>
        );

      case 'update_lead':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Name
              </label>
              <select
                value={config.fieldName || ''}
                onChange={(e) => handleConfigChange('fieldName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select field to update</option>
                <option value="status">Status</option>
                <option value="stage">Pipeline Stage</option>
                <option value="priority">Priority</option>
                <option value="assignedTo">Assigned To</option>
                <option value="notes">Notes</option>
                <option value="tags">Tags</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Value
              </label>
              <input
                type="text"
                value={config.fieldValue || ''}
                onChange={(e) => handleConfigChange('fieldValue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter field value"
              />
            </div>
          </div>
        );

      case 'create_task':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={config.taskTitle || ''}
                onChange={(e) => handleConfigChange('taskTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter task title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Description
              </label>
              <textarea
                value={config.taskDescription || ''}
                onChange={(e) => handleConfigChange('taskDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter task description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <input
                type="text"
                value={config.assignedTo || ''}
                onChange={(e) => handleConfigChange('assignedTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter assignee (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={config.dueDate || ''}
                onChange={(e) => handleConfigChange('dueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'api_call':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API URL
              </label>
              <input
                type="url"
                value={config.apiUrl || ''}
                onChange={(e) => handleConfigChange('apiUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter API URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HTTP Method
              </label>
              <select
                value={config.httpMethod || 'POST'}
                onChange={(e) => handleConfigChange('httpMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Headers (JSON)
              </label>
              <textarea
                value={config.headers || ''}
                onChange={(e) => handleConfigChange('headers', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter headers as JSON (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body (JSON)
              </label>
              <textarea
                value={config.body || ''}
                onChange={(e) => handleConfigChange('body', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter request body as JSON (optional)"
              />
            </div>
          </div>
        );

      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook URL
              </label>
              <input
                type="url"
                value={config.webhookUrl || ''}
                onChange={(e) => handleConfigChange('webhookUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter webhook URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HTTP Method
              </label>
              <select
                value={config.httpMethod || 'POST'}
                onChange={(e) => handleConfigChange('httpMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payload Template
              </label>
              <textarea
                value={config.payloadTemplate || ''}
                onChange={(e) => handleConfigChange('payloadTemplate', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter payload template as JSON"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-gray-500 text-sm">
            Select an action type to configure
          </div>
        );
    }
  };

  return (
    <div className={`action-configurator ${className}`}>
      {/* Action Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Action Type
        </label>
        <select
          value={selectedAction.type}
          onChange={(e) => handleActionTypeChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select action type</option>
          {availableActions.map(action => (
            <option key={action.type} value={action.type}>
              {action.name}
            </option>
          ))}
        </select>
      </div>

      {/* Basic Configuration */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Action Name
          </label>
          <input
            type="text"
            value={selectedAction.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter action name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={selectedAction.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter action description"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="action-enabled"
            checked={selectedAction.isEnabled}
            onChange={(e) => handleEnabledChange(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="action-enabled" className="ml-2 block text-sm text-gray-900">
            Enable this action
          </label>
        </div>
      </div>

      {/* Type-Specific Configuration */}
      {selectedAction.type && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Configuration</h4>
          {renderConfigForm()}
        </div>
      )}

      {/* Retry Configuration */}
      {selectedAction.type && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Retry Configuration</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Retries
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={selectedAction.retryConfig?.maxRetries || 0}
                onChange={(e) => handleRetryConfigChange('maxRetries', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retry Delay (seconds)
              </label>
              <input
                type="number"
                min="1"
                max="3600"
                value={selectedAction.retryConfig?.retryDelay || 60}
                onChange={(e) => handleRetryConfigChange('retryDelay', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Validation Messages */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm text-red-800">
            <div className="font-medium mb-1">Please fix the following errors:</div>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isValid ? 'Configuration is valid' : 'Configuration has errors'}
          </span>
        </div>
      </div>
    </div>
  );
};
