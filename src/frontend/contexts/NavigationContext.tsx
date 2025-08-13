import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

// Navigation state interface
interface NavigationState {
  isCollapsed: boolean;
  expandedItems: Set<string>;
  activePage: string;
  searchQuery: string;
  filterState: Record<string, any>;
  mobileCollapsed: boolean;
  isHydrated: boolean; // Add hydration state
}

// Navigation action types
type NavigationAction =
  | { type: 'TOGGLE_COLLAPSE' }
  | { type: 'SET_COLLAPSED'; payload: boolean }
  | { type: 'TOGGLE_EXPANDED_ITEM'; payload: string }
  | { type: 'SET_EXPANDED_ITEMS'; payload: Set<string> }
  | { type: 'SET_ACTIVE_PAGE'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTER_STATE'; payload: Record<string, any> }
  | { type: 'TOGGLE_MOBILE_COLLAPSED' }
  | { type: 'SET_MOBILE_COLLAPSED'; payload: boolean }
  | { type: 'SET_HYDRATED'; payload: boolean }
  | { type: 'RESET_STATE' };

// Initial navigation state
const initialState: NavigationState = {
  isCollapsed: false,
  expandedItems: new Set(),
  activePage: '/',
  searchQuery: '',
  filterState: {},
  mobileCollapsed: true,
  isHydrated: false, // Start as not hydrated
};

// Navigation reducer
function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case 'TOGGLE_COLLAPSE':
      return {
        ...state,
        isCollapsed: !state.isCollapsed,
      };
    
    case 'SET_COLLAPSED':
      return {
        ...state,
        isCollapsed: action.payload,
      };
    
    case 'TOGGLE_EXPANDED_ITEM': {
      const newExpandedItems = new Set(state.expandedItems);
      if (newExpandedItems.has(action.payload)) {
        newExpandedItems.delete(action.payload);
      } else {
        newExpandedItems.add(action.payload);
      }
      return {
        ...state,
        expandedItems: newExpandedItems,
      };
    }
    
    case 'SET_EXPANDED_ITEMS':
      return {
        ...state,
        expandedItems: action.payload,
      };
    
    case 'SET_ACTIVE_PAGE':
      return {
        ...state,
        activePage: action.payload,
      };
    
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      };
    
    case 'SET_FILTER_STATE':
      return {
        ...state,
        filterState: action.payload,
      };
    
    case 'TOGGLE_MOBILE_COLLAPSED':
      return {
        ...state,
        mobileCollapsed: !state.mobileCollapsed,
      };
    
    case 'SET_MOBILE_COLLAPSED':
      return {
        ...state,
        mobileCollapsed: action.payload,
      };
    
    case 'SET_HYDRATED':
      return {
        ...state,
        isHydrated: action.payload,
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Navigation context interface
interface NavigationContextType {
  state: NavigationState;
  dispatch: React.Dispatch<NavigationAction>;
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleExpandedItem: (itemId: string) => void;
  setExpandedItems: (items: Set<string>) => void;
  setActivePage: (page: string) => void;
  setSearchQuery: (query: string) => void;
  setFilterState: (filters: Record<string, any>) => void;
  toggleMobileCollapsed: () => void;
  setMobileCollapsed: (collapsed: boolean) => void;
  resetState: () => void;
}

// Create navigation context
const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Navigation provider props
interface NavigationProviderProps {
  children: ReactNode;
}

// Navigation provider component
export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(navigationReducer, initialState);
  const router = useRouter();

  // Load navigation state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('navigation_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Restore state, converting expandedItems back to Set
        if (parsedState.expandedItems) {
          parsedState.expandedItems = new Set(parsedState.expandedItems);
        }
        
        // Only restore non-route-specific state
        dispatch({
          type: 'SET_COLLAPSED',
          payload: parsedState.isCollapsed ?? false,
        });
        
        if (parsedState.expandedItems) {
          dispatch({
            type: 'SET_EXPANDED_ITEMS',
            payload: parsedState.expandedItems,
          });
        }
        
        if (parsedState.activePage) {
          dispatch({
            type: 'SET_ACTIVE_PAGE',
            payload: parsedState.activePage,
          });
        }
        
        dispatch({
          type: 'SET_MOBILE_COLLAPSED',
          payload: parsedState.mobileCollapsed ?? true,
        });
        dispatch({
          type: 'SET_HYDRATED',
          payload: true,
        });
      } else {
        dispatch({
          type: 'SET_HYDRATED',
          payload: true,
        });
      }
    } catch (error) {
      console.warn('Failed to load navigation state from localStorage:', error);
      // Ensure hydration state is set even if localStorage fails
      dispatch({
        type: 'SET_HYDRATED',
        payload: true,
      });
    }
  }, []);

  // Save navigation state to localStorage when it changes
  useEffect(() => {
    try {
      const stateToSave = {
        isCollapsed: state.isCollapsed,
        expandedItems: Array.from(state.expandedItems),
        activePage: state.activePage,
        mobileCollapsed: state.mobileCollapsed,
      };
      localStorage.setItem('navigation_state', JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save navigation state to localStorage:', error);
    }
  }, [state.isCollapsed, state.expandedItems, state.activePage, state.mobileCollapsed]);

  // Update active page when route changes
  useEffect(() => {
    dispatch({
      type: 'SET_ACTIVE_PAGE',
      payload: router.asPath,
    });
  }, [router.asPath]);

  // Convenience methods
  const toggleCollapse = () => dispatch({ type: 'TOGGLE_COLLAPSE' });
  const setCollapsed = (collapsed: boolean) => dispatch({ type: 'SET_COLLAPSED', payload: collapsed });
  const toggleExpandedItem = (itemId: string) => dispatch({ type: 'TOGGLE_EXPANDED_ITEM', payload: itemId });
  const setExpandedItems = (items: Set<string>) => dispatch({ type: 'SET_EXPANDED_ITEMS', payload: items });
  const setActivePage = (page: string) => dispatch({ type: 'SET_ACTIVE_PAGE', payload: page });
  const setSearchQuery = (query: string) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  const setFilterState = (filters: Record<string, any>) => dispatch({ type: 'SET_FILTER_STATE', payload: filters });
  const toggleMobileCollapsed = () => dispatch({ type: 'TOGGLE_MOBILE_COLLAPSED' });
  const setMobileCollapsed = (collapsed: boolean) => dispatch({ type: 'SET_MOBILE_COLLAPSED', payload: collapsed });
  const resetState = () => dispatch({ type: 'RESET_STATE' });

  const contextValue: NavigationContextType = {
    state,
    dispatch,
    toggleCollapse,
    setCollapsed,
    toggleExpandedItem,
    setExpandedItems,
    setActivePage,
    setSearchQuery,
    setFilterState,
    toggleMobileCollapsed,
    setMobileCollapsed,
    resetState,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

// Custom hook to use navigation context
export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  
  // Return fallback values if not yet hydrated to prevent SSR/hydration issues
  if (!context.state.isHydrated) {
    return {
      ...context,
      state: {
        ...context.state,
        isCollapsed: false,
        expandedItems: new Set(),
        activePage: '/',
        searchQuery: '',
        filterState: {},
        mobileCollapsed: true,
        isHydrated: false,
      },
      setCollapsed: () => {},
      toggleCollapse: () => {},
      toggleExpandedItem: () => {},
      setExpandedItems: () => {},
      setActivePage: () => {},
      setSearchQuery: () => {},
      setFilterState: () => {},
      toggleMobileCollapsed: () => {},
      setMobileCollapsed: () => {},
      resetState: () => {},
    };
  }
  
  return context;
};
