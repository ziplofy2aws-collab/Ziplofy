import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useSocket } from '../contexts/socket.context';

type Callback = (...args: any[]) => void;

/**
 * Custom hook for adding Socket.IO event listeners with automatic cleanup
 * @param event - The event name to listen for
 * @param callback - The callback function to execute when event is received
 * @param dependencies - Optional dependencies array for the callback
 */
export const useAddEventListener = (
  event: string,
  callback: Callback,
  dependencies: any[] = []
) => {
  const { socket, isConnected } = useSocket();
  const callbackRef = useRef<Callback>(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!socket || !event || !callback) return;

    const eventHandler = (...args: any[]) => {
      callbackRef.current(...args);
    };

    // Add event listener
    socket.on(event, eventHandler);

    // Cleanup on unmount
    return () => {
      socket.off(event, eventHandler);
    };
  }, [socket, event, ...dependencies]);

  return { isConnected };
};

export default useAddEventListener;
