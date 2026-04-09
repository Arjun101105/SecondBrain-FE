import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useCmdK() {
  const toggleCmdK = useStore((state) => state.toggleCmdK);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Toggle if Cmd+K (Mac) or Ctrl+K (Windows) is pressed
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCmdK();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [toggleCmdK]);
}
