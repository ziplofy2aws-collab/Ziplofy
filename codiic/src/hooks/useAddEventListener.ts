import { useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';

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
    if (!socket || !event || !callback) {
      return;
    }

    // Create a wrapper function that calls the current callback
    const eventHandler = (...args: any[]) => {
      callbackRef.current(...args);
    };

    // Add the event listener
    socket.on(event, eventHandler);

    // Cleanup function to remove the event listener
    return () => {
      socket.off(event, eventHandler);
    };
  }, [socket, event, ...dependencies]);

  // Return connection status for convenience
  return { isConnected };
};

export default useAddEventListener;
