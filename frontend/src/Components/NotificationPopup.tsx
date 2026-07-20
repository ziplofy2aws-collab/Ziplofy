import React, { useRef, useEffect } from 'react';
import NotificationList from './NotificationList';
import { useNotifications } from '../contexts/notification.context';
import { Notification } from './NotificationCard';
import './NotificationPopup.css';

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  isOpen,
  onClose,
  buttonRef,
}) => {
  const { notifications } = useNotifications();
  const popupRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Position popup relative to button
  useEffect(() => {
    if (isOpen && buttonRef?.current && popupRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const popup = popupRef.current;

      // Position popup below and to the right of the button
      const popupWidth = 380;
      const popupHeight = 500;
      let top = buttonRect.bottom + 8;
      let left = buttonRect.right - popupWidth;

      // Ensure popup doesn't go off screen
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (left < 8) left = 8;
      else if (left + popupWidth > viewportWidth - 8) left = viewportWidth - popupWidth - 8;

      if (top + popupHeight > viewportHeight - 8) top = buttonRect.top - popupHeight - 8;

      popup.style.position = 'fixed';
      popup.style.top = `${top}px`;
      popup.style.left = `${left}px`;
      popup.style.zIndex = '9999';
    }
  }, [isOpen, buttonRef]);

  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification);
    // Add additional logic here if needed
  };

  if (!isOpen) return null;

  return (
    <div className="notification-popup-overlay">
      <div ref={popupRef} className="notification-popup">
        <NotificationList
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
        />
      </div>
    </div>
  );
};

export default NotificationPopup;
