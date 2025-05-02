import { useEffect, useState } from "react";

import type { ToastActionElement, ToastProps } from "../components/ui/toast";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function generateId() {
  return `${count++}`;
}

// Singleton pattern to manage toast state
const toastState = {
  toasts: [] as ToasterToast[],
  listeners: new Set<() => void>(),
  
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },
  
  notify() {
    this.listeners.forEach((listener) => listener());
  },
  
  addToast(toast: Omit<ToasterToast, "id">) {
    const id = generateId();
    
    this.toasts = [
      { id, ...toast },
      ...this.toasts,
    ].slice(0, TOAST_LIMIT);
    
    this.notify();
    
    return id;
  },
  
  updateToast(id: string, toast: Partial<ToasterToast>) {
    this.toasts = this.toasts.map((t) => (t.id === id ? { ...t, ...toast } : t));
    this.notify();
  },
  
  dismissToast(id: string) {
    this.toasts = this.toasts.map((t) =>
      t.id === id ? { ...t, open: false } : t
    );
    this.notify();
  },
  
  removeToast(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  },
};

export function useToast() {
  const [toasts, setToasts] = useState<ToasterToast[]>(toastState.toasts);
  
  useEffect(() => {
    return toastState.subscribe(() => {
      setToasts([...toastState.toasts]);
    });
  }, []);
  
  function toast(props: Omit<ToasterToast, "id">) {
    const id = toastState.addToast(props);
    
    setTimeout(() => {
      toastState.dismissToast(id);
      
      setTimeout(() => {
        toastState.removeToast(id);
      }, 300);
    }, TOAST_REMOVE_DELAY);
    
    return {
      id,
      dismiss: () => toastState.dismissToast(id),
      update: (props: Partial<ToasterToast>) => toastState.updateToast(id, props),
    };
  }
  
  return {
    toasts,
    toast,
    dismiss: (id: string) => toastState.dismissToast(id),
  };
}