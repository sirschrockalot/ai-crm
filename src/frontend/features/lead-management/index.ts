// Lead Management Feature - Barrel Exports

// Types
export * from './types/lead';

// Services
export { leadService } from './services/leadService';

// Hooks
export { usePipeline } from './hooks/usePipeline';
export { useLeads } from './hooks/useLeads';
export { useLeadCommunication } from './hooks/useLeadCommunication';

// Components
export { PipelineBoard } from './components/PipelineBoard';
export { PipelineCard } from './components/PipelineCard';
export { PipelineStage } from './components/PipelineStage';
export { LeadDetail } from './components/LeadDetail';
export { LeadForm } from './components/LeadForm';
export { CommunicationPanel } from './components/CommunicationPanel';
export { ImportExportPanel } from './components/ImportExportPanel';
export { LeadPipeline } from './components/LeadPipeline';
export { LeadAnalytics } from './components/LeadAnalytics';
export { LeadImportExport } from './components/LeadImportExport';

// Lazy Components
export { LazyLeadDetail, LazyLeadForm, LazyCommunicationPanel, LazyImportExportPanel } from './components/LazyComponents';

// Performance Utilities
export * from './utils/performance';

// Enhanced Lead Management Components (Epic 2 Migration)
export { PipelineBoard as EnhancedPipelineBoard } from './components/PipelineBoard';
export { PipelineCard as EnhancedPipelineCard } from './components/PipelineCard';
export { PipelineStage as EnhancedPipelineStage } from './components/PipelineStage';
export { LeadDetail as EnhancedLeadDetail } from './components/LeadDetail';
export { LeadForm as EnhancedLeadForm } from './components/LeadForm';
