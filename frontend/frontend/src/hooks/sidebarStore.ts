import { create } from "zustand";

interface SidebarState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true, // Default to open on larger screens
  setIsOpen: (isOpen) => set({ isOpen }),
}));

export default useSidebarStore;