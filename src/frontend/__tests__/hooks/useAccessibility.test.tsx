import { renderHook, act } from '@testing-library/react';
import { useAccessibility } from '../../hooks/useAccessibility';

describe('useAccessibility', () => {
  let mockElement: HTMLElement;
  let mockEvent: FocusEvent;

  beforeEach(() => {
    mockElement = document.createElement('div');
    mockEvent = new FocusEvent('focus');
    
    // Mock getBoundingClientRect
    mockElement.getBoundingClientRect = jest.fn().mockReturnValue({
      top: 0,
      left: 0,
      width: 100,
      height: 50,
      bottom: 50,
      right: 100,
    });
  });

  describe('Initial State', () => {
    it('returns initial accessibility state', () => {
      const { result } = renderHook(() => useAccessibility());
      
      expect(result.current.focusedElement).toBeNull();
      expect(result.current.announcement).toBe('');
      expect(result.current.isAnnouncing).toBe(false);
      expect(result.current.liveRegion).toBeNull();
    });

    it('initializes with provided options', () => {
      const options = { 
        enableLiveAnnouncements: true, 
        enableFocusManagement: true 
      };
      const { result } = renderHook(() => useAccessibility(options));
      
      expect(result.current.enableLiveAnnouncements).toBe(true);
      expect(result.current.enableFocusManagement).toBe(true);
    });
  });

  describe('Focus Management', () => {
    it('tracks focused element', () => {
      const { result } = renderHook(() => useAccessibility());
      
      act(() => {
        result.current.handleFocus(mockEvent);
      });
      
      expect(result.current.focusedElement).toBe(mockElement);
    });

    it('handles focus loss', () => {
      const { result } = renderHook(() => useAccessibility());
      
      // First focus
      act(() => {
        result.current.handleFocus(mockEvent);
      });
      
      expect(result.current.focusedElement).toBe(mockElement);
      
      // Then blur
      const blurEvent = new FocusEvent('blur');
      act(() => {
        result.current.handleBlur(blurEvent);
      });
      
      expect(result.current.focusedElement).toBeNull();
    });

    it('manages focus history', () => {
      const { result } = renderHook(() => useAccessibility());
      
      const element1 = document.createElement('button');
      const element2 = document.createElement('input');
      
      // Focus first element
      const focusEvent1 = new FocusEvent('focus');
      Object.defineProperty(focusEvent1, 'target', { value: element1 });
      
      act(() => {
        result.current.handleFocus(focusEvent1);
      });
      
      expect(result.current.focusedElement).toBe(element1);
      
      // Focus second element
      const focusEvent2 = new FocusEvent('focus');
      Object.defineProperty(focusEvent2, 'target', { value: element2 });
      
      act(() => {
        result.current.handleFocus(focusEvent2);
      });
      
      expect(result.current.focusedElement).toBe(element2);
    });

    it('prevents focus on disabled elements', () => {
      const { result } = renderHook(() => useAccessibility());
      
      mockElement.setAttribute('disabled', 'true');
      
      act(() => {
        result.current.handleFocus(mockEvent);
      });
      
      expect(result.current.focusedElement).not.toBe(mockElement);
    });

    it('handles focus on hidden elements', () => {
      const { result } = renderHook(() => useAccessibility());
      
      mockElement.style.display = 'none';
      
      act(() => {
        result.current.handleFocus(mockEvent);
      });
      
      expect(result.current.focusedElement).not.toBe(mockElement);
    });
  });

  describe('Live Announcements', () => {
    it('announces messages to screen readers', () => {
      const { result } = renderHook(() => useAccessibility({ enableLiveAnnouncements: true }));
      
      act(() => {
        result.current.announce('Navigation menu opened');
      });
      
      expect(result.current.announcement).toBe('Navigation menu opened');
      expect(result.current.isAnnouncing).toBe(true);
    });

    it('queues multiple announcements', () => {
      const { result } = renderHook(() => useAccessibility({ enableLiveAnnouncements: true }));
      
      act(() => {
        result.current.announce('First message');
        result.current.announce('Second message');
      });
      
      expect(result.current.announcement).toBe('Second message');
    });

    it('clears announcements after delay', async () => {
      jest.useFakeTimers();
      
      const { result } = renderHook(() => useAccessibility({ enableLiveAnnouncements: true }));
      
      act(() => {
        result.current.announce('Test message');
      });
      
      expect(result.current.isAnnouncing).toBe(true);
      
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      expect(result.current.isAnnouncing).toBe(false);
      expect(result.current.announcement).toBe('');
      
      jest.useRealTimers();
    });

    it('handles announcement priority', () => {
      const { result } = renderHook(() => useAccessibility({ enableLiveAnnouncements: true }));
      
      act(() => {
        result.current.announce('Low priority message', 'low');
        result.current.announce('High priority message', 'high');
      });
      
      expect(result.current.announcement).toBe('High priority message');
    });

    it('respects announcement timing', () => {
      const { result } = renderHook(() => useAccessibility({ enableLiveAnnouncements: true }));
      
      act(() => {
        result.current.announce('Quick message', 'low', 1000);
      });
      
      expect(result.current.isAnnouncing).toBe(true);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(result.current.isAnnouncing).toBe(false);
    });
  });

  describe('ARIA Management', () => {
    it('sets ARIA attributes correctly', () => {
      const { result } = renderHook(() => useAccessibility());
      
      act(() => {
        result.current.setAriaAttribute(mockElement, 'aria-expanded', 'true');
      });
      
      expect(mockElement.getAttribute('aria-expanded')).toBe('true');
    });

    it('removes ARIA attributes', () => {
      const { result } = renderHook(() => useAccessibility());
      
      // Set attribute first
      act(() => {
        result.current.setAriaAttribute(mockElement, 'aria-expanded', 'true');
      });
      
      // Then remove it
      act(() => {
        result.current.removeAriaAttribute(mockElement, 'aria-expanded');
      });
      
      expect(mockElement.hasAttribute('aria-expanded')).toBe(false);
    });

    it('manages multiple ARIA attributes', () => {
      const { result } = renderHook(() => useAccessibility());
      
      act(() => {
        result.current.setAriaAttributes(mockElement, {
          'aria-expanded': 'true',
          'aria-controls': 'menu',
          'aria-label': 'Navigation menu'
        });
      });
      
      expect(mockElement.getAttribute('aria-expanded')).toBe('true');
      expect(mockElement.getAttribute('aria-controls')).toBe('menu');
      expect(mockElement.getAttribute('aria-label')).toBe('Navigation menu');
    });

    it('validates ARIA attribute values', () => {
      const { result } = renderHook(() => useAccessibility());
      
      act(() => {
        result.current.setAriaAttribute(mockElement, 'aria-expanded', 'invalid');
      });
      
      // Should not set invalid values
      expect(mockElement.getAttribute('aria-expanded')).not.toBe('invalid');
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('registers keyboard shortcuts', () => {
      const { result } = renderHook(() => useAccessibility());
      const callback = jest.fn();
      
      act(() => {
        result.current.registerKeyboardShortcut('Ctrl+Shift+N', callback);
      });
      
      expect(result.current.keyboardShortcuts.has('Ctrl+Shift+N')).toBe(true);
    });

    it('handles keyboard shortcut execution', () => {
      const { result } = renderHook(() => useAccessibility());
      const callback = jest.fn();
      
      act(() => {
        result.current.registerKeyboardShortcut('Ctrl+Shift+N', callback);
      });
      
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'n',
        ctrlKey: true,
        shiftKey: true
      });
      
      act(() => {
        result.current.handleKeyDown(keyEvent);
      });
      
      expect(callback).toHaveBeenCalled();
    });

    it('prevents default for registered shortcuts', () => {
      const { result } = renderHook(() => useAccessibility());
      const callback = jest.fn();
      
      act(() => {
        result.current.registerKeyboardShortcut('Ctrl+Shift+N', callback);
      });
      
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'n',
        ctrlKey: true,
        shiftKey: true
      });
      keyEvent.preventDefault = jest.fn();
      
      act(() => {
        result.current.handleKeyDown(keyEvent);
      });
      
      expect(keyEvent.preventDefault).toHaveBeenCalled();
    });

    it('unregisters keyboard shortcuts', () => {
      const { result } = renderHook(() => useAccessibility());
      const callback = jest.fn();
      
      act(() => {
        result.current.registerKeyboardShortcut('Ctrl+Shift+N', callback);
      });
      
      expect(result.current.keyboardShortcuts.has('Ctrl+Shift+N')).toBe(true);
      
      act(() => {
        result.current.unregisterKeyboardShortcut('Ctrl+Shift+N');
      });
      
      expect(result.current.keyboardShortcuts.has('Ctrl+Shift+N')).toBe(false);
    });
  });

  describe('Screen Reader Support', () => {
    it('detects screen reader usage', () => {
      const { result } = renderHook(() => useAccessibility());
      
      // Mock screen reader detection
      Object.defineProperty(window, 'navigator', {
        value: {
          userAgent: 'NVDA/2023.1'
        },
        writable: true
      });
      
      expect(result.current.isScreenReaderActive).toBe(true);
    });

    it('provides screen reader specific announcements', () => {
      const { result } = renderHook(() => useAccessibility({ enableLiveAnnouncements: true }));
      
      // Mock screen reader detection
      Object.defineProperty(window, 'navigator', {
        value: {
          userAgent: 'JAWS/2023'
        },
        writable: true
      });
      
      act(() => {
        result.current.announce('Screen reader specific message');
      });
      
      expect(result.current.announcement).toBe('Screen reader specific message');
    });

    it('adapts behavior for different assistive technologies', () => {
      const { result } = renderHook(() => useAccessibility());
      
      // Test with different user agents
      const userAgents = ['NVDA/2023.1', 'JAWS/2023', 'VoiceOver/15.0'];
      
      userAgents.forEach(userAgent => {
        Object.defineProperty(window, 'navigator', {
          value: { userAgent },
          writable: true
        });
        
        expect(result.current.assistiveTechnology).toBeDefined();
      });
    });
  });

  describe('Focus Trapping', () => {
    it('traps focus within container', () => {
      const { result } = renderHook(() => useAccessibility());
      
      const container = document.createElement('div');
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      const button3 = document.createElement('button');
      
      container.appendChild(button1);
      container.appendChild(button2);
      container.appendChild(button3);
      
      act(() => {
        result.current.trapFocus(container);
      });
      
      expect(result.current.focusTrap).toBe(container);
    });

    it('releases focus trap', () => {
      const { result } = renderHook(() => useAccessibility());
      
      const container = document.createElement('div');
      
      act(() => {
        result.current.trapFocus(container);
      });
      
      expect(result.current.focusTrap).toBe(container);
      
      act(() => {
        result.current.releaseFocusTrap();
      });
      
      expect(result.current.focusTrap).toBeNull();
    });

    it('handles focus cycling within trap', () => {
      const { result } = renderHook(() => useAccessibility());
      
      const container = document.createElement('div');
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      
      container.appendChild(button1);
      container.appendChild(button2);
      
      act(() => {
        result.current.trapFocus(container);
      });
      
      // Focus first button
      button1.focus();
      
      // Try to tab past last button
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      button2.dispatchEvent(tabEvent);
      
      // Focus should cycle back to first button
      expect(document.activeElement).toBe(button1);
    });
  });

  describe('Performance and Optimization', () => {
    it('debounces rapid announcements', () => {
      jest.useFakeTimers();
      
      const { result } = renderHook(() => useAccessibility({ enableLiveAnnouncements: true }));
      
      // Make rapid announcements
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.announce(`Message ${i}`);
        });
      }
      
      // Should only show last announcement
      expect(result.current.announcement).toBe('Message 4');
      
      jest.useRealTimers();
    });

    it('memoizes callback functions', () => {
      const { result, rerender } = renderHook(() => useAccessibility());
      
      const initialHandleFocus = result.current.handleFocus;
      
      rerender();
      
      expect(result.current.handleFocus).toBe(initialHandleFocus);
    });

    it('handles large numbers of elements efficiently', () => {
      const { result } = renderHook(() => useAccessibility());
      
      const elements = Array.from({ length: 1000 }, () => document.createElement('div'));
      
      expect(() => {
        elements.forEach(element => {
          result.current.setAriaAttribute(element, 'aria-label', 'test');
        });
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('handles invalid element references gracefully', () => {
      const { result } = renderHook(() => useAccessibility());
      
      expect(() => {
        act(() => {
          result.current.setAriaAttribute(null as any, 'aria-label', 'test');
        });
      }).not.toThrow();
    });

    it('handles invalid ARIA values gracefully', () => {
      const { result } = renderHook(() => useAccessibility());
      
      expect(() => {
        act(() => {
          result.current.setAriaAttribute(mockElement, 'aria-expanded', null as any);
        });
      }).not.toThrow();
    });

    it('handles focus errors gracefully', () => {
      const { result } = renderHook(() => useAccessibility());
      
      // Mock element that throws on focus
      const problematicElement = {
        focus: () => { throw new Error('Focus error'); }
      } as any;
      
      expect(() => {
        act(() => {
          result.current.focusElement(problematicElement);
        });
      }).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('works with navigation context', () => {
      const { result } = renderHook(() => useAccessibility());
      
      // Should integrate without errors
      expect(result.current.focusedElement).toBeNull();
      expect(result.current.announcement).toBe('');
    });

    it('integrates with keyboard navigation', () => {
      const { result } = renderHook(() => useAccessibility());
      
      const keyEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      
      expect(() => {
        act(() => {
          result.current.handleKeyDown(keyEvent);
        });
      }).not.toThrow();
    });

    it('provides accessibility context', () => {
      const { result } = renderHook(() => useAccessibility());
      
      expect(result.current.accessibilityContext).toBeDefined();
      expect(typeof result.current.accessibilityContext.announce).toBe('function');
      expect(typeof result.current.accessibilityContext.setAriaAttribute).toBe('function');
    });
  });
});
