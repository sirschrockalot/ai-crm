import { EventEmitter } from 'events';

export interface LoadingState {
  id: string;
  isLoading: boolean;
  progress?: number;
  message?: string;
  type?: 'spinner' | 'progress' | 'skeleton';
  startTime: number;
  estimatedDuration?: number;
}

export interface LoadingConfig {
  enableGlobalLoading?: boolean;
  showProgress?: boolean;
  defaultMessage?: string;
  timeout?: number;
}

class LoadingService extends EventEmitter {
  private loadingStates: Map<string, LoadingState> = new Map();
  private globalLoading = false;
  private config: LoadingConfig;

  constructor(config: LoadingConfig = {}) {
    super();
    this.config = {
      enableGlobalLoading: true,
      showProgress: true,
      defaultMessage: 'Loading...',
      timeout: 30000, // 30 seconds
      ...config,
    };
  }

  public startLoading(
    id: string,
    options: {
      message?: string;
      type?: 'spinner' | 'progress' | 'skeleton';
      estimatedDuration?: number;
    } = {}
  ): void {
    const loadingState: LoadingState = {
      id,
      isLoading: true,
      message: options.message || this.config.defaultMessage,
      type: options.type || 'spinner',
      startTime: Date.now(),
      estimatedDuration: options.estimatedDuration,
    };

    this.loadingStates.set(id, loadingState);
    this.updateGlobalLoading();
    this.emit('loading_started', loadingState);

    // Set timeout for automatic cleanup
    if (this.config.timeout) {
      setTimeout(() => {
        if (this.loadingStates.has(id)) {
          console.warn(`Loading state ${id} timed out after ${this.config.timeout}ms`);
          this.stopLoading(id);
        }
      }, this.config.timeout);
    }
  }

  public stopLoading(id: string): void {
    const loadingState = this.loadingStates.get(id);
    if (!loadingState) return;

    loadingState.isLoading = false;
    this.loadingStates.delete(id);
    this.updateGlobalLoading();
    this.emit('loading_stopped', loadingState);
  }

  public updateProgress(id: string, progress: number, message?: string): void {
    const loadingState = this.loadingStates.get(id);
    if (!loadingState) return;

    loadingState.progress = Math.min(Math.max(progress, 0), 100);
    if (message) {
      loadingState.message = message;
    }

    this.emit('progress_updated', loadingState);
  }

  public getLoadingState(id: string): LoadingState | undefined {
    return this.loadingStates.get(id);
  }

  public isGlobalLoading(): boolean {
    return this.globalLoading;
  }

  public getActiveLoadingStates(): LoadingState[] {
    return Array.from(this.loadingStates.values());
  }

  public getLoadingCount(): number {
    return this.loadingStates.size;
  }

  public clearAllLoading(): void {
    const states = Array.from(this.loadingStates.keys());
    states.forEach(id => this.stopLoading(id));
  }

  private updateGlobalLoading(): void {
    if (!this.config.enableGlobalLoading) return;

    const wasGlobalLoading = this.globalLoading;
    this.globalLoading = this.loadingStates.size > 0;

    if (wasGlobalLoading !== this.globalLoading) {
      this.emit('global_loading_changed', this.globalLoading);
    }
  }

  public getGlobalLoadingState(): LoadingState | null {
    if (!this.globalLoading) return null;

    // Return the most recent loading state
    const states = Array.from(this.loadingStates.values());
    return states.sort((a, b) => b.startTime - a.startTime)[0] || null;
  }

  public setConfig(newConfig: Partial<LoadingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('config_updated', this.config);
  }

  public getConfig(): LoadingConfig {
    return { ...this.config };
  }
}

// Create default instance
export const loadingService = new LoadingService();

// Export for use in other modules
export default loadingService;
