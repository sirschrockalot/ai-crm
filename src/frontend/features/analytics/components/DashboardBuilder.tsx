import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { FiPlus, FiGrid, FiSave, FiShare2, FiDownload } from 'react-icons/fi';
import { Card, DashboardWidget } from '../../../components/ui';
import { ChartDataPoint } from '../types/analytics';

interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'heatmap' | 'progress';
  data?: any;
  config?: any;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

interface DashboardBuilderProps {
  dashboardId?: string;
  onSave?: (dashboard: any) => void;
  onShare?: (dashboardId: string) => void;
  onExport?: (dashboardId: string) => void;
}

export const DashboardBuilder: React.FC<DashboardBuilderProps> = ({
  dashboardId,
  onSave,
  onShare,
  onExport,
}) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newWidget, setNewWidget] = useState({
    title: '',
    type: 'metric' as const,
    config: {},
  });

  // Mock dashboard data
  const mockWidgets: DashboardWidget[] = [
    {
      id: 'widget-1',
      title: 'Total Leads',
      type: 'metric',
      config: {
        metricValue: '1,234',
        metricChange: 12.5,
        metricTrend: 'up' as const,
      },
    },
    {
      id: 'widget-2',
      title: 'Lead Growth',
      type: 'chart',
      config: {
        chartType: 'line',
        showLegend: true,
        showGrid: true,
      },
      data: [
        { label: 'Jan', value: 100 },
        { label: 'Feb', value: 120 },
        { label: 'Mar', value: 140 },
        { label: 'Apr', value: 160 },
      ],
    },
    {
      id: 'widget-3',
      title: 'Conversion Rate',
      type: 'chart',
      config: {
        chartType: 'pie',
        showLegend: true,
      },
      data: [
        { label: 'Qualified', value: 45 },
        { label: 'In Progress', value: 30 },
        { label: 'Closed', value: 25 },
      ],
    },
  ];

  useEffect(() => {
    // Load dashboard widgets
    setWidgets(mockWidgets);
  }, [dashboardId]);

  const handleAddWidget = () => {
    if (!newWidget.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a widget title',
        status: 'error',
      });
      return;
    }

    const widget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      title: newWidget.title,
      type: newWidget.type,
      config: newWidget.config,
    };

    setWidgets([...widgets, widget]);
    setNewWidget({ title: '', type: 'metric', config: {} });
    onClose();
    
    toast({
      title: 'Widget Added',
      description: 'New widget has been added to the dashboard',
      status: 'success',
    });
  };

  const handleEditWidget = (widgetId: string) => {
    console.log('Edit widget:', widgetId);
    // Open widget edit modal
  };

  const handleDeleteWidget = (widgetId: string) => {
    setWidgets(widgets.filter(widget => widget.id !== widgetId));
    toast({
      title: 'Widget Deleted',
      description: 'Widget has been removed from the dashboard',
      status: 'success',
    });
  };

  const handleSaveDashboard = () => {
    onSave?.({
      id: dashboardId,
      widgets,
      layout: 'grid',
      createdAt: new Date().toISOString(),
    });
    
    toast({
      title: 'Dashboard Saved',
      description: 'Dashboard configuration has been saved',
      status: 'success',
    });
  };

  const handleShareDashboard = () => {
    onShare?.(dashboardId || '');
    toast({
      title: 'Dashboard Shared',
      description: 'Dashboard sharing link has been generated',
      status: 'success',
    });
  };

  const handleExportDashboard = () => {
    onExport?.(dashboardId || '');
    toast({
      title: 'Dashboard Exported',
      description: 'Dashboard has been exported successfully',
      status: 'success',
    });
  };

  return (
    <VStack align="stretch" spacing={6}>
      {/* Dashboard Header */}
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Heading size="lg">Dashboard Builder</Heading>
          <Text color="gray.600">
            {dashboardId ? `Editing Dashboard: ${dashboardId}` : 'Create New Dashboard'}
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={onOpen}
          >
            Add Widget
          </Button>
          <Button
            leftIcon={<FiSave />}
            variant="outline"
            onClick={handleSaveDashboard}
          >
            Save
          </Button>
          <Button
            leftIcon={<FiShare2 />}
            variant="outline"
            onClick={handleShareDashboard}
          >
            Share
          </Button>
          <Button
            leftIcon={<FiDownload />}
            variant="outline"
            onClick={handleExportDashboard}
          >
            Export
          </Button>
        </HStack>
      </HStack>

      {/* Widget Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {widgets.map((widget) => (
          <DashboardWidget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            type={widget.type}
            data={widget.data}
            config={widget.config}
            onEdit={handleEditWidget}
            onDelete={handleDeleteWidget}
          />
        ))}
      </SimpleGrid>

      {/* Add Widget Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Widget</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Widget Title</FormLabel>
                <Input
                  value={newWidget.title}
                  onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
                  placeholder="Enter widget title"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Widget Type</FormLabel>
                <Select
                  value={newWidget.type}
                  onChange={(e) => setNewWidget({ ...newWidget, type: e.target.value as any })}
                >
                  <option value="metric">Metric</option>
                  <option value="chart">Chart</option>
                  <option value="table">Table</option>
                  <option value="heatmap">Heatmap</option>
                  <option value="progress">Progress</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleAddWidget}>
              Add Widget
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};
