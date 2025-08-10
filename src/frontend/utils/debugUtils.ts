// Debug utilities for troubleshooting
export const debugUtils = {
  // Clear all localStorage data
  clearAllLocalStorage: () => {
    if (typeof window === 'undefined') {
      console.log('Cannot clear localStorage: not in browser environment');
      return;
    }
    
    try {
      window.localStorage.clear();
      console.log('✅ All localStorage data cleared');
    } catch (error) {
      console.error('❌ Error clearing localStorage:', error);
    }
  },

  // Check localStorage for invalid values
  checkLocalStorage: () => {
    if (typeof window === 'undefined') {
      console.log('Cannot check localStorage: not in browser environment');
      return;
    }

    console.log('🔍 Checking localStorage for invalid values...');
    
    const keys = Object.keys(window.localStorage);
    let invalidKeys = 0;

    keys.forEach(key => {
      try {
        const value = window.localStorage.getItem(key);
        if (value === 'undefined' || value === 'null' || value === '') {
          console.log(`❌ Invalid value for key "${key}": "${value}"`);
          invalidKeys++;
        } else if (value) {
          try {
            JSON.parse(value);
          } catch (parseError) {
            console.log(`❌ Invalid JSON for key "${key}": ${value}`);
            invalidKeys++;
          }
        }
      } catch (error) {
        console.log(`❌ Error checking key "${key}":`, error);
        invalidKeys++;
      }
    });

    if (invalidKeys === 0) {
      console.log('✅ All localStorage values are valid');
    } else {
      console.log(`⚠️  Found ${invalidKeys} invalid localStorage values`);
    }
  },

  // Show current localStorage contents
  showLocalStorage: () => {
    if (typeof window === 'undefined') {
      console.log('Cannot show localStorage: not in browser environment');
      return;
    }

    console.log('📋 Current localStorage contents:');
    const keys = Object.keys(window.localStorage);
    
    if (keys.length === 0) {
      console.log('   (empty)');
    } else {
      keys.forEach(key => {
        try {
          const value = window.localStorage.getItem(key);
          console.log(`   ${key}: ${value}`);
        } catch (error) {
          console.log(`   ${key}: [ERROR READING]`);
        }
      });
    }
  },

  // Reset specific localStorage keys
  resetLocalStorageKeys: (keys: string[]) => {
    if (typeof window === 'undefined') {
      console.log('Cannot reset localStorage: not in browser environment');
      return;
    }

    keys.forEach(key => {
      try {
        window.localStorage.removeItem(key);
        console.log(`✅ Removed localStorage key: ${key}`);
      } catch (error) {
        console.error(`❌ Error removing localStorage key "${key}":`, error);
      }
    });
  },

  // Get environment information
  getEnvironmentInfo: () => {
    console.log('🌍 Environment Information:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   NEXT_PUBLIC_BYPASS_AUTH: ${process.env.NEXT_PUBLIC_BYPASS_AUTH}`);
    console.log(`   NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`);
    console.log(`   User Agent: ${typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}`);
    console.log(`   Local Storage Available: ${typeof window !== 'undefined' && 'localStorage' in window}`);
  },
};

// Make debug utilities available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugUtils = debugUtils;
  console.log('🔧 Debug utilities available at window.debugUtils');
  console.log('   Available commands:');
  console.log('   - debugUtils.clearAllLocalStorage()');
  console.log('   - debugUtils.checkLocalStorage()');
  console.log('   - debugUtils.showLocalStorage()');
  console.log('   - debugUtils.resetLocalStorageKeys(["key1", "key2"])');
  console.log('   - debugUtils.getEnvironmentInfo()');
}
