import { create } from 'zustand'

interface AppState {
  isCmdKOpen: boolean;
  activeItem: any | null;
  activeFilter: string | null;
  searchQuery: string;
  isShareModalOpen: boolean;
  toggleCmdK: () => void;
  setCmdKOpen: (isOpen: boolean) => void;
  setActiveItem: (item: any | null) => void;
  setActiveFilter: (filter: string | null) => void;
  setSearchQuery: (query: string) => void;
  setShareModalOpen: (isOpen: boolean) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  isCmdKOpen: false,
  activeItem: null,
  activeFilter: null,
  searchQuery: '',
  isShareModalOpen: false,
  toggleCmdK: () => set((state) => ({ isCmdKOpen: !state.isCmdKOpen })),
  setCmdKOpen: (isOpen) => set({ isCmdKOpen: isOpen }),
  setActiveItem: (item) => set({ activeItem: item }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setShareModalOpen: (isOpen) => set({ isShareModalOpen: isOpen }),
  logout: () => {
    localStorage.removeItem('secondbrain_jwt');
    window.location.href = '/';
  },
}));
