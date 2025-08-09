// TriggerConfigurator Component
// Configuration interface for workflow triggers

import React, { useState, useEffect } from 'react';
import { TriggerConfiguratorProps, Trigger } from '../types/automation';

export const TriggerConfigurator: React.FC<TriggerConfiguratorProps> = ({
  trigger,
  availableTriggers,
  onTriggerChange,
  className = '',
}) => {
  const [selectedTrigger, setSelectedTrigger] = useState(trigger);
  const [config, setConfig] = useState(trigger.config);
  const [isValid, setIsValid] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  // Update trigger when props change
  useEffect(() => {
    setSelectedTrigger(trigger);
    setConfig(trigger.config);
  }, [trigger]);

  // Validate configuration
  useEffect(() => {
    const newErrors: string[] = [];
    
    if (!selectedTrigger.name.trim()) {
      newErrors.push('Trigger name is required');
    }
    
    if (!selectedTrigger.type) {
      newErrors.push('Trigger type is required');
    }
    
    // Validate based on trigger type
    switch (selectedTrigger.type) {
      case 'email':
        if (!config.emailAddress) {
          newErrors.push('Email address is required');
        }
        break;
      case 'sms':
        if (!config.phoneNumber) {
          newErrors.push('Phone number is required');
        }
        break;
      case 'lead_status_change':
        if (!config.statusField) {
          newErrors.push('Status field is required');
        }
        break;
      case 'form_submission':
        if (!config.formId) {
          newErrors.push('Form ID is required');
        }
        break;
      case 'api_webhook':
        if (!config.webhookUrl) {
          newErrors.push('Webhook URL is required');
        }
        break;
      case 'schedule':
        if (!config.schedule) {
          newErrors.push('Schedule configuration is required');
        }
        break;
    }
    
    setErrors(newErrors);
    setIsValid(newErrors.length === 0);
  }, [selectedTrigger, config]);

  // Handle trigger type change
  const handleTriggerTypeChange = (type: string) => {
    const newTrigger = {
      ...selectedTrigger,
      type: type as any,
      config: {},
    };
    setSelectedTrigger(newTrigger);
    setConfig({});
    onTriggerChange(newTrigger);
  };

  // Handle config change
  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    
    const updatedTrigger = {
      ...selectedTrigger,
      config: newConfig,
    };
    setSelectedTrigger(updatedTrigger);
    onTriggerChange(updatedTrigger);
  };

  // Handle name change
  const handleNameChange = (name: string) => {
    const updatedTrigger = {
      ...selectedTrigger,
      name,
    };
    setSelectedTrigger(updatedTrigger);
    onTriggerChange(updatedTrigger);
  };

  // Handle description change
  const handleDescriptionChange = (description: string) => {
    const updatedTrigger = {
      ...selectedTrigger,
      description,
    };
    setSelectedTrigger(updatedTrigger);
    onTriggerChange(updatedTrigger);
  };

  // Handle enabled/disabled toggle
  const handleEnabledChange = (isEnabled: boolean) => {
    const updatedTrigger = {
      ...selectedTrigger,
      isEnabled,
    };
    setSelectedTrigger(updatedTrigger);
    onTriggerChange(updatedTrigger);
  };

  // Render configuration form based on trigger type
  const renderConfigForm = () => {
    switch (selectedTrigger.type) {
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={config.emailAddress || ''}
                onChange={(e) => handleConfigChange('emailAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Pattern
              </label>
              <input
                type="text"
                value={config.subjectPattern || ''}
                onChange={(e) => handleConfigChange('subjectPattern', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter subject pattern (optional)"
              />
            </div>
          </div>
        );

      case 'sms':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={config.phoneNumber || ''}
                onChange={(e) => handleConfigChange('phoneNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message Pattern
              </label>
              <input
                type="text"
                value={config.messagePattern || ''}
                onChange={(e) => handleConfigChange('messagePattern', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter message pattern (optional)"
              />
            </div>
          </div>
        );

      case 'lead_status_change':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Field
              </label>
              <select
                value={config.statusField || ''}
                onChange={(e) => handleConfigChange('statusField', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select status field</option>
                <option value="status">Lead Status</option>
                <option value="stage">Pipeline Stage</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Status
              </label>
              <input
                type="text"
                value={config.fromStatus || ''}
                onChange={(e) => handleConfigChange('fromStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter from status (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Status
              </label>
              <input
                type="text"
                value={config.toStatus || ''}
                onChange={(e) => handleConfigChange('toStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter to status (optional)"
              />
            </div>
          </div>
        );

      case 'form_submission':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Form ID
              </label>
              <input
                type="text"
                value={config.formId || ''}
                onChange={(e) => handleConfigChange('formId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter form ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Form Name
              </label>
              <input
                type="text"
                value={config.formName || ''}
                onChange={(e) => handleConfigChange('formName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter form name (optional)"
              />
            </div>
          </div>
        );

      case 'api_webhook':
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
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Type
              </label>
              <select
                value={config.scheduleType || 'cron'}
                onChange={(e) => handleConfigChange('scheduleType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="cron">Cron Expression</option>
                <option value="interval">Interval</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Value
              </label>
              <input
                type="text"
                value={config.scheduleValue || ''}
                onChange={(e) => handleConfigChange('scheduleValue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter schedule value"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-gray-500 text-sm">
            Select a trigger type to configure
          </div>
        );
    }
  };

  return (
    <div className={`trigger-configurator ${className}`}>
      {/* Trigger Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trigger Type
        </label>
        <select
          value={selectedTrigger.type}
          onChange={(e) => handleTriggerTypeChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select trigger type</option>
          {availableTriggers.map(trigger => (
            <option key={trigger.type} value={trigger.type}>
              {trigger.name}
            </option>
          ))}
        </select>
      </div>

      {/* Basic Configuration */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trigger Name
          </label>
          <input
            type="text"
            value={selectedTrigger.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter trigger name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={selectedTrigger.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter trigger description"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="trigger-enabled"
            checked={selectedTrigger.isEnabled}
            onChange={(e) => handleEnabledChange(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="trigger-enabled" className="ml-2 block text-sm text-gray-900">
            Enable this trigger
          </label>
        </div>
      </div>

      {/* Type-Specific Configuration */}
      {selectedTrigger.type && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Configuration</h4>
          {renderConfigForm()}
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
