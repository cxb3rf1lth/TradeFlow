import { useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const shortcut = shortcuts.find(
        (s) =>
          s.key.toLowerCase() === event.key.toLowerCase() &&
          !!s.ctrlKey === (event.ctrlKey || event.metaKey) &&
          !!s.shiftKey === event.shiftKey &&
          !!s.altKey === event.altKey
      );

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
}

export function useGlobalShortcuts() {
  const [, setLocation] = useLocation();

  const shortcuts: KeyboardShortcut[] = [
    { key: 'h', description: 'Go to Dashboard', action: () => setLocation('/') },
    { key: 'n', description: 'Go to Notes', action: () => setLocation('/notes') },
    { key: 't', description: 'Go to Tasks', action: () => setLocation('/tasks') },
    { key: 'e', description: 'Go to Email Center', action: () => setLocation('/email') },
    { key: 'l', description: 'Go to Team Lounge', action: () => setLocation('/team-lounge') },
    { key: 'a', description: 'Go to Analytics', action: () => setLocation('/analytics') },
    { key: 's', description: 'Go to Settings', action: () => setLocation('/settings') },
    { key: '/', ctrlKey: true, description: 'Search', action: () => {
      const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
      if (searchInput) searchInput.focus();
    }},
  ];

  useKeyboardShortcuts(shortcuts);
}
