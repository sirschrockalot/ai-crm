// Temporary compatibility wrapper
// This component maintains backward compatibility while we transition to the unified navigation system
import React from 'react';
import NavigationPanel from '../NavigationPanel/NavigationPanel';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  return <NavigationPanel {...props} />;
};

export default Sidebar;
