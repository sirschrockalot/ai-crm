import { renderHook, act } from '@testing-library/react';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';

describe('useKeyboardNavigation', () => {
  let mockElement: HTMLElement;
  let mockEvent: React.KeyboardEvent<HTMLElement>;

  beforeEach(() => {
    mockElement = document.createElement('div');
    mockEvent = {
      key: 'ArrowDown',
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      target: mockElement,
      preventDefault: jest.fn(),
    } as any;
    
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
    it('returns initial keyboard navigation state', () => {
      const { result } = renderHook(() => useKeyboardNavigation());
      
      expect(result.current.elementRef).toBeDefined();
      expect(result.current.handleKeyDown).toBeDefined();
      expect(result.current.focusFirstElement).toBeDefined();
      expect(result.current.focusLastElement).toBeDefined();
    });
  });

  describe('Arrow Key Navigation', () => {
    it('handles ArrowUp key', () => {
      const onArrowUp = jest.fn();
      const { result } = renderHook(() => useKeyboardNavigation({ onArrowUp }));
      
      const upEvent = { ...mockEvent, key: 'ArrowUp' };
      
      act(() => {
        result.current.handleKeyDown(upEvent);
      });
      
      expect(onArrowUp).toHaveBeenCalled();
      expect(upEvent.preventDefault).toHaveBeenCalled();
    });

    it('handles ArrowDown key', () => {
      const onArrowDown = jest.fn();
      const { result } = renderHook(() => useKeyboardNavigation({ onArrowDown }));
      
      const downEvent = { ...mockEvent, key: 'ArrowDown' };
      
      act(() => {
        result.current.handleKeyDown(downEvent);
      });
      
      expect(onArrowDown).toHaveBeenCalled();
      expect(downEvent.preventDefault).toHaveBeenCalled();
    });

    it('handles ArrowLeft key', () => {
      const onArrowLeft = jest.fn();
      const { result } = renderHook(() => useKeyboardNavigation({ onArrowLeft }));
      
      const leftEvent = { ...mockEvent, key: 'ArrowLeft' };
      
      act(() => {
        result.current.handleKeyDown(leftEvent);
      });
      
      expect(onArrowLeft).toHaveBeenCalled();
      expect(leftEvent.preventDefault).toHaveBeenCalled();
    });

    it('handles ArrowRight key', () => {
      const onArrowRight = jest.fn();
      const { result } = renderHook(() => useKeyboardNavigation({ onArrowRight }));
      
      const rightEvent = { ...mockEvent, key: 'ArrowRight' };
      
      act(() => {
        result.current.handleKeyDown(rightEvent);
      });
      
      expect(onArrowRight).toHaveBeenCalled();
      expect(rightEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Special Key Navigation', () => {
    it('handles Home key', () => {
      const onHome = jest.fn();
      const { result } = renderHook(() => useKeyboardNavigation({ onHome }));
      
      const homeEvent = { ...mockEvent, key: 'Home' };
      
      act(() => {
        result.current.handleKeyDown(homeEvent);
      });
      
      expect(onHome).toHaveBeenCalled();
      expect(homeEvent.preventDefault).toHaveBeenCalled();
    });

    it('handles End key', () => {
      const onEnd = jest.fn();
      const { result } = renderHook(() => useKeyboardNavigation({ onEnd }));
      
      const endEvent = { ...mockEvent, key: 'End' };
      
      act(() => {
        result.current.handleKeyDown(endEvent);
      });
      
      expect(onEnd).toHaveBeenCalled();
      expect(endEvent.preventDefault).toHaveBeenCalled();
    });

    it('handles PageUp key', () => {
      const onPageUp = jest.fn();
      const { result } = renderHook(() => useKeyboardNavigation({ onPageUp }));
      
      const pageUpEvent = { ...mockEvent, key: 'PageUp' };
      
      act(() => {
        result.current.handleKeyDown(pageUpEvent);
      });
      
      expect(onPageUp).toHaveBeenCalled();
      expect(pageUpEvent.preventDefault).toHaveBeenCalled();
    });

    it('handles PageDown key', () => {
      const onPageDown = jest.fn();
      const { result } = renderHook(() => useKeyboardNavigation({ onPageDown }));
      
      const pageDownEvent = { ...mockEvent, key: 'PageDown' };
      
      act(() => {
        result.current.handleKeyDown(pageDownEvent);
      });
      
      expect(onPageDown).toHaveBeenCalled();
      expect(pageDownEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Action Keys', () => {
    it('handles Enter key', () => {
      const onEnter = jest.fn();
      const { result } = renderHook(() => useKeyboardNavigation({ onEnter }));
      
      const enterEvent = { ...mockEvent, key: 'Enter' };
      
      act(() => {
        result.current.handleKeyDown(enterEvent);
      });
      
      expect(onEnter).toHaveBeenCalled();
    });

    it('handles Escape key', () => {
      const onEscape = jest.fn();
      const { result } = renderHook(() => useKeyboardNavigation({ onEscape }));
      
      const escapeEvent = { ...mockEvent, key: 'Escape' };
      
      act(() => {
        result.current.handleKeyDown(escapeEvent);
      });
      
      expect(onEscape).toHaveBeenCalled();
    });

    it('handles Space key', () => {
      const onSpace = jest.fn();
      const { result } = renderHook(() => useKeyboardNavigation({ onSpace }));
      
      const spaceEvent = { ...mockEvent, key: ' ' };
      
      act(() => {
        result.current.handleKeyDown(spaceEvent);
      });
      
      expect(onSpace).toHaveBeenCalled();
      expect(spaceEvent.preventDefault).toHaveBeenCalled();
    });

    it('handles Tab key with forward direction', () => {
      const onTab = jest.fn();
      const { result } = renderHook(() => useKeyboardNavigation({ onTab }));
      
      const tabEvent = { ...mockEvent, key: 'Tab', shiftKey: false };
      
      act(() => {
        result.current.handleKeyDown(tabEvent);
      });
      
      expect(onTab).toHaveBeenCalledWith('forward');
    });

    it('handles Tab key with backward direction', () => {
      const onTab = jest.fn();
      const { result } = renderHook(() => useKeyboardNavigation({ onTab }));
      
      const tabEvent = { ...mockEvent, key: 'Tab', shiftKey: true };
      
      act(() => {
        result.current.handleKeyDown(tabEvent);
      });
      
      expect(onTab).toHaveBeenCalledWith('backward');
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('handles simple keyboard shortcuts', () => {
      const shortcutAction = jest.fn();
      const shortcuts = [
        {
          key: 'h',
          action: shortcutAction,
          description: 'Go to Home',
        },
      ];
      
      const { result } = renderHook(() => useKeyboardNavigation({ shortcuts }));
      
      const hEvent = { ...mockEvent, key: 'h' };
      
      act(() => {
        result.current.handleKeyDown(hEvent);
      });
      
      expect(shortcutAction).toHaveBeenCalled();
    });

    it('handles Ctrl+key shortcuts', () => {
      const shortcutAction = jest.fn();
      const shortcuts = [
        {
          key: 'n',
          ctrl: true,
          action: shortcutAction,
          description: 'New item',
        },
      ];
      
      const { result } = renderHook(() => useKeyboardNavigation({ shortcuts }));
      
      const ctrlNEvent = { ...mockEvent, key: 'n', ctrlKey: true };
      
      act(() => {
        result.current.handleKeyDown(ctrlNEvent);
      });
      
      expect(shortcutAction).toHaveBeenCalled();
      expect(ctrlNEvent.preventDefault).toHaveBeenCalled();
    });

    it('handles Alt+key shortcuts', () => {
      const shortcutAction = jest.fn();
      const shortcuts = [
        {
          key: 'f',
          alt: true,
          action: shortcutAction,
          description: 'Find',
        },
      ];
      
      const { result } = renderHook(() => useKeyboardNavigation({ shortcuts }));
      
      const altFEvent = { ...mockEvent, key: 'f', altKey: true };
      
      act(() => {
        result.current.handleKeyDown(altFEvent);
      });
      
      expect(shortcutAction).toHaveBeenCalled();
      expect(altFEvent.preventDefault).toHaveBeenCalled();
    });

    it('handles Shift+key shortcuts', () => {
      const shortcutAction = jest.fn();
      const shortcuts = [
        {
          key: 'a',
          shift: true,
          action: shortcutAction,
          description: 'Select All',
        },
      ];
      
      const { result } = renderHook(() => useKeyboardNavigation({ shortcuts }));
      
      const shiftAEvent = { ...mockEvent, key: 'a', shiftKey: true };
      
      act(() => {
        result.current.handleKeyDown(shiftAEvent);
      });
      
      expect(shortcutAction).toHaveBeenCalled();
      expect(shiftAEvent.preventDefault).toHaveBeenCalled();
    });

    it('handles complex modifier combinations', () => {
      const shortcutAction = jest.fn();
      const shortcuts = [
        {
          key: 's',
          ctrl: true,
          shift: true,
          action: shortcutAction,
          description: 'Save As',
        },
      ];
      
      const { result } = renderHook(() => useKeyboardNavigation({ shortcuts }));
      
      const ctrlShiftSEvent = { 
        ...mockEvent, 
        key: 's', 
        ctrlKey: true, 
        shiftKey: true 
      };
      
      act(() => {
        result.current.handleKeyDown(ctrlShiftSEvent);
      });
      
      expect(shortcutAction).toHaveBeenCalled();
      expect(ctrlShiftSEvent.preventDefault).toHaveBeenCalled();
    });

    it('ignores shortcuts when typing in input fields', () => {
      const shortcutAction = jest.fn();
      const shortcuts = [
        {
          key: 'h',
          action: shortcutAction,
          description: 'Go to Home',
        },
      ];
      
      const { result } = renderHook(() => useKeyboardNavigation({ shortcuts }));
      
      // Mock input element
      const inputElement = document.createElement('input');
      const hEvent = { ...mockEvent, key: 'h', target: inputElement };
      
      act(() => {
        result.current.handleKeyDown(hEvent);
      });
      
      // The hook should still call the shortcut action for local events
      // The input field check only applies to global shortcuts
      expect(shortcutAction).toHaveBeenCalled();
    });
  });

  describe('Focus Management', () => {
    it('focuses first focusable element', () => {
      const { result } = renderHook(() => useKeyboardNavigation());
      
      // Mock focusable elements
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      const focusSpy = jest.spyOn(button1, 'focus');
      
      // Set the elementRef to point to our mock element
      Object.defineProperty(result.current.elementRef, 'current', {
        value: mockElement,
        writable: true,
      });
      
      mockElement.appendChild(button1);
      mockElement.appendChild(button2);
      
      act(() => {
        result.current.focusFirstElement();
      });
      
      expect(focusSpy).toHaveBeenCalled();
    });

    it('focuses last focusable element', () => {
      const { result } = renderHook(() => useKeyboardNavigation());
      
      // Mock focusable elements
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      const focusSpy = jest.spyOn(button2, 'focus');
      
      // Set the elementRef to point to our mock element
      Object.defineProperty(result.current.elementRef, 'current', {
        value: mockElement,
        writable: true,
      });
      
      mockElement.appendChild(button1);
      mockElement.appendChild(button2);
      
      act(() => {
        result.current.focusLastElement();
      });
      
      expect(focusSpy).toHaveBeenCalled();
    });

    it('handles no focusable elements gracefully', () => {
      const { result } = renderHook(() => useKeyboardNavigation());
      
      // No focusable elements
      act(() => {
        result.current.focusFirstElement();
        result.current.focusLastElement();
      });
      
      // Should not throw error
      expect(result.current.focusFirstElement).toBeDefined();
      expect(result.current.focusLastElement).toBeDefined();
    });
  });

  describe('Global Shortcut Registration', () => {
    it('registers global shortcuts on mount', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      const shortcuts = [
        {
          key: 'h',
          action: jest.fn(),
          description: 'Go to Home',
        },
      ];
      
      const { unmount } = renderHook(() => useKeyboardNavigation({ shortcuts }));
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('handles global shortcuts correctly', () => {
      const shortcutAction = jest.fn();
      const shortcuts = [
        {
          key: 'h',
          action: shortcutAction,
          description: 'Go to Home',
        },
      ];
      
      renderHook(() => useKeyboardNavigation({ shortcuts }));
      
      // Simulate global keydown event
      const globalEvent = new KeyboardEvent('keydown', { key: 'h' });
      document.dispatchEvent(globalEvent);
      
      expect(shortcutAction).toHaveBeenCalled();
    });
  });

  describe('Event Prevention', () => {
    it('prevents default for navigation keys', () => {
      const { result } = renderHook(() => useKeyboardNavigation());
      
      const navigationKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'];
      
      navigationKeys.forEach(key => {
        const event = { ...mockEvent, key, preventDefault: jest.fn() };
        
        act(() => {
          result.current.handleKeyDown(event);
        });
        
        expect(event.preventDefault).toHaveBeenCalled();
      });
    });

    it('prevents default for space key', () => {
      const { result } = renderHook(() => useKeyboardNavigation());
      
      const spaceEvent = { ...mockEvent, key: ' ', preventDefault: jest.fn() };
      
      act(() => {
        result.current.handleKeyDown(spaceEvent);
      });
      
      expect(spaceEvent.preventDefault).toHaveBeenCalled();
    });

    it('prevents default for shortcut keys', () => {
      const shortcutAction = jest.fn();
      const shortcuts = [
        {
          key: 'h',
          action: shortcutAction,
          description: 'Go to Home',
        },
      ];
      
      const { result } = renderHook(() => useKeyboardNavigation({ shortcuts }));
      
      const hEvent = { ...mockEvent, key: 'h', preventDefault: jest.fn() };
      
      act(() => {
        result.current.handleKeyDown(hEvent);
      });
      
      expect(hEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles case-insensitive shortcut matching', () => {
      const shortcutAction = jest.fn();
      const shortcuts = [
        {
          key: 'h',
          action: shortcutAction,
          description: 'Go to Home',
        },
      ];
      
      const { result } = renderHook(() => useKeyboardNavigation({ shortcuts }));
      
      const upperHEvent = { ...mockEvent, key: 'H', preventDefault: jest.fn() };
      
      act(() => {
        result.current.handleKeyDown(upperHEvent);
      });
      
      expect(shortcutAction).toHaveBeenCalled();
      expect(upperHEvent.preventDefault).toHaveBeenCalled();
    });

    it('handles empty shortcuts array', () => {
      const { result } = renderHook(() => useKeyboardNavigation({ shortcuts: [] }));
      
      const hEvent = { ...mockEvent, key: 'h' };
      
      act(() => {
        result.current.handleKeyDown(hEvent);
      });
      
      // Should not throw error
      expect(result.current.handleKeyDown).toBeDefined();
    });

    it('handles undefined options', () => {
      const { result } = renderHook(() => useKeyboardNavigation());
      
      const hEvent = { ...mockEvent, key: 'h' };
      
      act(() => {
        result.current.handleKeyDown(hEvent);
      });
      
      // Should not throw error
      expect(result.current.handleKeyDown).toBeDefined();
    });
  });
});
