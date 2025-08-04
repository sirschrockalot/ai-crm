# Lead Management Pipeline Components

This directory contains the visual pipeline management components for the DealCycle CRM system. The pipeline provides a drag-and-drop interface for managing leads through different sales stages.

## 🎯 Overview

The pipeline system consists of:
- **PipelineBoard**: Main container component that displays all stages
- **PipelineStage**: Individual stage columns that contain leads
- **PipelineCard**: Individual lead cards that can be dragged between stages
- **PipelinePage**: Complete page component with full functionality

## 📁 File Structure

```
lead-management/
├── components/
│   ├── PipelineBoard.tsx          # Main pipeline container
│   ├── PipelineStage.tsx          # Individual stage component
│   ├── PipelineCard.tsx           # Individual lead card
│   ├── __tests__/                 # Component tests
│   └── index.ts                   # Component exports
├── pages/
│   └── PipelinePage.tsx           # Complete pipeline page
├── services/
│   └── pipelineService.ts         # API service layer
├── hooks/
│   └── usePipeline.ts             # Custom React hook
├── types/
│   └── pipeline.ts                # TypeScript interfaces
└── README.md                      # This file
```

## 🚀 Quick Start

### Basic Usage

```tsx
import { PipelineBoard } from './components';
import { usePipeline } from './hooks/usePipeline';

const MyPipeline = () => {
  const { stages, leads, handleLeadMove, isLoading } = usePipeline({
    tenantId: 'your-tenant-id',
  });

  return (
    <PipelineBoard
      stages={stages}
      leads={leads}
      onLeadMove={handleLeadMove}
      isLoading={isLoading}
    />
  );
};
```

### Complete Page Implementation

```tsx
import PipelinePage from './pages/PipelinePage';

// Use the complete pipeline page
<PipelinePage />
```

## 🧩 Components

### PipelineBoard

The main container component that displays the entire pipeline interface.

**Props:**
- `stages`: Array of pipeline stages
- `leads`: Array of leads
- `onLeadMove`: Callback when a lead is moved
- `onStageAdd`: Callback when adding a new stage
- `onStageEdit`: Callback when editing a stage
- `onLeadClick`: Callback when a lead is clicked
- `isLoading`: Loading state

### PipelineStage

Individual stage column that contains leads for that stage.

**Props:**
- `stage`: Stage data object
- `leads`: Array of leads for this stage
- `onLeadClick`: Callback when a lead is clicked
- `onStageEdit`: Callback when editing the stage
- `onLeadAdd`: Callback when adding a lead to this stage
- `isLoading`: Loading state

### PipelineCard

Individual lead card that displays lead information and can be dragged.

**Props:**
- `lead`: Lead data object
- `onClick`: Callback when card is clicked

## 🔧 Features

### Drag and Drop
- Smooth drag-and-drop functionality using `react-beautiful-dnd`
- Visual feedback during drag operations
- Drop zone indicators
- Drag validation

### Responsive Design
- Mobile-friendly interface
- Horizontal scrolling for many stages
- Responsive card layouts

### Real-time Updates
- Auto-refresh functionality
- Optimistic updates
- Error handling and retry logic

### Accessibility
- WCAG 2.1 compliant
- Keyboard navigation support
- Screen reader friendly
- High contrast support

## 🎨 Styling

The components use Chakra UI for consistent styling and theming:

- **Color Scheme**: Supports light/dark mode
- **Typography**: Consistent font hierarchy
- **Spacing**: Standardized spacing system
- **Components**: Pre-built Chakra UI components

## 📊 Data Flow

1. **Data Fetching**: `usePipeline` hook fetches stages and leads
2. **State Management**: React Query handles caching and updates
3. **User Interactions**: Events trigger API calls via service layer
4. **Optimistic Updates**: UI updates immediately, syncs with server
5. **Error Handling**: Toast notifications for user feedback

## 🧪 Testing

Components include comprehensive tests:

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test PipelineBoard.test.tsx
```

## 🔌 API Integration

The pipeline integrates with the backend API through the `pipelineService`:

- **Stages**: CRUD operations for pipeline stages
- **Leads**: CRUD operations for leads
- **Analytics**: Pipeline performance metrics
- **Settings**: Pipeline configuration

## 🚀 Performance

- **Virtualization**: Large lists are virtualized for performance
- **Caching**: React Query provides intelligent caching
- **Debouncing**: API calls are debounced to prevent spam
- **Lazy Loading**: Components load on demand

## 🔒 Security

- **Tenant Isolation**: All data is scoped to tenant
- **Authentication**: JWT token authentication
- **Authorization**: Role-based access control
- **Data Validation**: Input validation on all forms

## 📈 Analytics

The pipeline includes built-in analytics:

- **Conversion Rates**: Stage-to-stage conversion tracking
- **Velocity**: Time spent in each stage
- **Bottlenecks**: Identification of slow stages
- **Forecasting**: Predictive analytics for pipeline performance

## 🎯 Future Enhancements

- **Advanced Filtering**: Filter leads by various criteria
- **Bulk Operations**: Select and move multiple leads
- **Automation Rules**: Automatic lead movement based on triggers
- **Integration**: Connect with external CRM systems
- **Mobile App**: Native mobile pipeline interface

## 🤝 Contributing

When contributing to the pipeline components:

1. Follow the existing code style
2. Add tests for new functionality
3. Update documentation
4. Ensure accessibility compliance
5. Test across different browsers

## 📚 Resources

- [Chakra UI Documentation](https://chakra-ui.com/)
- [React Beautiful DnD](https://github.com/atlassian/react-beautiful-dnd)
- [React Query](https://react-query.tanstack.com/)
- [TypeScript](https://www.typescriptlang.org/) 