import React, { useRef, useEffect } from "react";
import "./MessagesPopup.css";

interface MessagesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

const MessagesPopup: React.FC<MessagesPopupProps> = ({
  isOpen,
  onClose,
  buttonRef,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

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
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && buttonRef?.current && popupRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const popup = popupRef.current;
      const popupWidth = 320;
      const popupHeight = 360;
      let top = buttonRect.bottom + 8;
      let left = buttonRect.right - popupWidth;

      if (left < 8) left = 8;
      if (left + popupWidth > window.innerWidth - 8) {
        left = window.innerWidth - popupWidth - 8;
      }
      if (top + popupHeight > window.innerHeight - 8) {
        top = buttonRect.top - popupHeight - 8;
      }

      popup.style.position = "fixed";
      popup.style.top = `${top}px`;
      popup.style.left = `${left}px`;
      popup.style.zIndex = "9999";
    }
  }, [isOpen, buttonRef]);

  if (!isOpen) return null;

  return (
    <div className="messages-popup-overlay">
      <div ref={popupRef} className="messages-popup">
        <div className="messages-popup-header">
          <h3>Messages</h3>
        </div>
        <div className="messages-popup-body">
          <p className="messages-empty">No new messages.</p>
          <p className="messages-hint">Messages will appear here when you receive them.</p>
        </div>
      </div>
    </div>
  );
};

export default MessagesPopup;
