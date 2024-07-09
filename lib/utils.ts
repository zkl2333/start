import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Listener<T = any> = (arg: T) => void;

export const createEventBus = () => {
  const listeners: Record<string, Listener[]> = {};

  const on = (event: string, listener: Listener) => {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(listener);
  };

  const off = (event: string, listener: Listener) => {
    if (!listeners[event]) {
      return;
    }
    listeners[event] = listeners[event].filter((l) => l !== listener);
  };

  const emit = (event: string, arg?: any) => {
    if (!listeners[event]) {
      return;
    }
    listeners[event].forEach((listener) => listener(arg));
  };

  return {
    on,
    off,
    emit,
  };
};
