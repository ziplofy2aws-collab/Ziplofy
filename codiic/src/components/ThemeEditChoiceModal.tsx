import React from "react";
import "./ThemeEditChoiceModal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  themeId: string;
  isCustomTheme?: boolean;
}

const ThemeEditChoiceModal: React.FC<Props> = ({ isOpen, onClose, themeId, isCustomTheme = false }) => {
  if (!isOpen) return null;

  const handleEditLayout = () => {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const storeId = localStorage.getItem('storeId') || sessionStorage.getItem('storeId');
    
    // Custom themes: use id param (no type=installed). Installed themes: use type=installed
    let builderUrl = isCustomTheme
      ? `/themes/builder?id=${encodeURIComponent(themeId)}`
      : `/themes/builder?id=${encodeURIComponent(themeId)}&type=installed`;
    if (accessToken) {
      builderUrl += `&accessToken=${encodeURIComponent(accessToken)}`;
    }
    if (storeId) {
      builderUrl += `&storeId=${encodeURIComponent(storeId)}`;
    }
    
    window.open(builderUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleEditCode = () => {
    window.open(`/themes/code/${themeId}`, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleEditBasicElementor = () => {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const storeId = localStorage.getItem('storeId') || sessionStorage.getItem('storeId');
    
    // Custom themes: use id param (no type=installed). Installed themes: use type=installed
    let builderUrl = isCustomTheme
      ? `/themes/basic-elementor?id=${encodeURIComponent(themeId)}`
      : `/themes/basic-elementor?id=${encodeURIComponent(themeId)}&type=installed`;
    if (accessToken) {
      builderUrl += `&accessToken=${encodeURIComponent(accessToken)}`;
    }
    if (storeId) {
      builderUrl += `&storeId=${encodeURIComponent(storeId)}`;
    }
    
    window.open(builderUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="theme-edit-modal-overlay">
      <div className="theme-edit-modal-backdrop" onClick={onClose} />
      <div className="theme-edit-modal-container">
        <div className="theme-edit-modal-header">Edit Theme</div>
        <div className="theme-edit-modal-body">
          <button onClick={handleEditLayout} className="theme-edit-option-btn option-visual">
            Edit Layout (Visual)
            <span className="option-desc">Open Elementor-style visual builder to modify layout and components</span>
          </button>
          <button onClick={handleEditBasicElementor} className="theme-edit-option-btn option-elementor">
            Edit with Basic Elementor
            <span className="option-desc">Open basic Elementor editor</span>
          </button>
          <button onClick={handleEditCode} className="theme-edit-option-btn option-code">
            Edit Code (Advanced)
            <span className="option-desc">Open code editor (Monaco) to edit HTML/CSS/JS</span>
          </button>
        </div>
        <div className="theme-edit-modal-footer">
          <button onClick={onClose} className="theme-edit-close-btn">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ThemeEditChoiceModal;


