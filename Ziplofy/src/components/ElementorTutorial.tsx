import React, { useState, useEffect, useRef } from 'react';
import './ElementorTutorial.css';

interface TutorialCard {
  id: string;
  title: string;
  icon: string;
  description: string;
  steps?: string[];
  arrowPosition?: 'left' | 'right' | 'top' | 'bottom';
  arrowTarget?: string; // CSS selector or element ID to point to
  cardPosition?: 'left' | 'right' | 'top' | 'bottom'; // Where to position card relative to target
}

const tutorialCards: TutorialCard[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: '🚀',
    description: 'Welcome to the Elementor Builder! Start building your theme by dragging elements from the left panel.',
    steps: [
      'Browse elements in the left panel',
      'Drag and drop elements onto the canvas',
      'Click on elements to select and edit them',
      'Use the right panel to style your elements'
    ],
    arrowTarget: '#blocks-panel',
    cardPosition: 'right',
    arrowPosition: 'left'
  },
  {
    id: 'elements-panel',
    title: 'Elements Panel',
    icon: '📦',
    description: 'The left panel contains all available elements you can add to your page.',
    steps: [
      'Search for elements using the search bar',
      'Elements are organized by categories (Layout, Basic, Media, etc.)',
      'Drag any element onto the canvas to add it',
      'Double-click text elements to edit them directly'
    ],
    arrowPosition: 'left', // Arrow points left from card to target
    arrowTarget: '#blocks-panel',
    cardPosition: 'right'
  },
  {
    id: 'style-panel',
    title: 'Style Panel',
    icon: '🎨',
    description: 'Customize the appearance of your selected elements using the Style panel on the right.',
    steps: [
      'Select any element on the canvas',
      'The Style panel will show all available styling options',
      'Adjust colors, spacing, typography, and more',
      'Changes are applied instantly to your element'
    ],
    arrowPosition: 'right', // Arrow points right from card to target
    arrowTarget: '#style-panel',
    cardPosition: 'left'
  },
  {
    id: 'structure-panel',
    title: 'Structure Panel',
    icon: '🏗️',
    description: 'View and manage the structure of your page elements in the Structure panel.',
    steps: [
      'See all elements in a hierarchical view',
      'Click on elements in the structure to select them',
      'Navigate complex layouts easily',
      'Understand parent-child relationships'
    ],
    arrowPosition: 'right', // Arrow points right from card to target
    arrowTarget: '#layers-panel',
    cardPosition: 'left'
  },
  {
    id: 'responsive-design',
    title: 'Responsive Design',
    icon: '📱',
    description: 'Preview and customize your design for different screen sizes.',
    steps: [
      'Use the device icons in the top bar (Desktop, Tablet, Mobile)',
      'Switch between devices to see how your design looks',
      'Adjust styles for each device size',
      'Ensure your theme looks great on all devices'
    ],
    arrowPosition: 'top', // Arrow points up from card to target
    arrowTarget: '.panel__devices',
    cardPosition: 'bottom'
  },
  {
    id: 'save-preview',
    title: 'Save & Preview',
    icon: '💾',
    description: 'Save your work and preview how it will look to your users.',
    steps: [
      'Click "Save" to save your current progress',
      'Use "Preview" to see how your theme looks',
      'Click "Apply" to make this theme active',
      'Your changes are saved automatically'
    ],
    arrowPosition: 'right', // Arrow on right side of card, pointing right to buttons
    arrowTarget: '.builder-top-bar button', // Target the buttons in the top bar
    cardPosition: 'left' // Card positioned on the left side
  },
  {
    id: 'tips-tricks',
    title: 'Tips & Tricks',
    icon: '💡',
    description: 'Helpful tips to make the most of the Elementor Builder.',
    steps: [
      'Use sections and containers for better layout control',
      'Combine multiple elements for complex designs',
      'Experiment with different style options',
      'Save frequently to avoid losing your work'
    ],
    arrowTarget: '.builder-center-panel',
    cardPosition: 'top',
    arrowPosition: 'bottom'
  }
];

interface ElementorTutorialProps {
  onClose?: () => void;
}

const ElementorTutorial: React.FC<ElementorTutorialProps> = ({ onClose }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [cardPosition, setCardPosition] = useState({ top: 0, left: 0 });
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({
    visibility: 'visible',
    opacity: 1,
    display: 'flex',
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'next' | 'prev' | null>(null);
  const [lastDirection, setLastDirection] = useState<'next' | 'prev' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentCard = tutorialCards[currentCardIndex];
  const isFirstCard = currentCardIndex === 0;
  const isLastCard = currentCardIndex === tutorialCards.length - 1;

  // Calculate card position based on target element
  useEffect(() => {
    if (!currentCard.arrowTarget || !showTutorial) return;

    const updatePosition = () => {
      let targetElement: Element | null = null;
      
      // Special handling for save-preview card to find the Save/Preview buttons
      if (currentCard.id === 'save-preview') {
        const topBar = document.querySelector('.builder-top-bar');
        if (topBar) {
          // Find buttons that contain "Save", "Preview", or "Apply"
          const buttons = Array.from(topBar.querySelectorAll('button'));
          const actionButtons = buttons.filter(btn => {
            const text = btn.textContent?.trim() || '';
            return text === 'Save' || text === 'Preview' || text === 'Apply' || text === 'Saving...';
          });
          
          if (actionButtons.length > 0) {
            // Always create a bounding box that encompasses all action buttons for better accuracy
            const firstRect = actionButtons[0].getBoundingClientRect();
            const lastRect = actionButtons[actionButtons.length - 1].getBoundingClientRect();
            const virtualRect = {
              left: firstRect.left,
              top: firstRect.top,
              right: lastRect.right,
              bottom: Math.max(firstRect.bottom, lastRect.bottom),
              width: lastRect.right - firstRect.left,
              height: Math.max(firstRect.height, lastRect.height),
              x: firstRect.left,
              y: firstRect.top,
              toJSON: () => ({})
            };
            // Use the first button as target element but store virtual rect
            targetElement = actionButtons[0];
            (targetElement as any).__virtualRect = virtualRect;
          } else {
            // Fallback: try to find any button in the top bar's right section
            const rightSection = topBar.querySelector('div[style*="flex: 1"]')?.nextElementSibling;
            if (rightSection) {
              const fallbackButtons = Array.from(rightSection.querySelectorAll('button'));
              if (fallbackButtons.length > 0) {
                targetElement = fallbackButtons[0];
              }
            }
          }
        }
      } else {
        targetElement = document.querySelector(currentCard.arrowTarget!);
      }
      
      if (!targetElement || !cardRef.current) return;

      let targetRect = targetElement.getBoundingClientRect();
      
      // Use virtual rect if available (for save-preview with multiple buttons)
      if ((targetElement as any).__virtualRect) {
        targetRect = (targetElement as any).__virtualRect;
      }
      const cardRect = cardRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let top = 0;
      let left = 0;

      switch (currentCard.cardPosition) {
        case 'right':
          // For save-preview, position on right side of window, aligned with buttons
          if (currentCard.id === 'save-preview') {
            // Position card vertically aligned with buttons
            top = targetRect.top + scrollY + (targetRect.height / 2) - (cardRect.height / 2);
            // Position to the right of the buttons, but ensure it's visible on screen
            // Try to position it to the right of buttons first
            const desiredLeft = targetRect.right + scrollX + 20;
            const maxLeft = window.innerWidth + scrollX - cardRect.width - 20;
            // If there's not enough space on the right, position it to the left of buttons
            if (desiredLeft > maxLeft) {
              left = targetRect.left + scrollX - cardRect.width - 20;
            } else {
              left = desiredLeft;
            }
          } else {
            top = targetRect.top + scrollY + (targetRect.height / 2) - (cardRect.height / 2);
            left = targetRect.right + scrollX + 20;
          }
          break;
        case 'left':
          // For save-preview, position on left side of buttons, aligned with buttons
          if (currentCard.id === 'save-preview') {
            // Position card vertically aligned with buttons
            top = targetRect.top + scrollY + (targetRect.height / 2) - (cardRect.height / 2);
            // Position to the left of the buttons, but ensure it's visible on screen
            const desiredLeft = targetRect.left + scrollX - cardRect.width - 20;
            const minLeft = scrollX + 20;
            // If there's not enough space on the left, position it to the right of buttons
            if (desiredLeft < minLeft) {
              left = targetRect.right + scrollX + 20;
            } else {
              left = desiredLeft;
            }
          } else {
            top = targetRect.top + scrollY + (targetRect.height / 2) - (cardRect.height / 2);
            left = targetRect.left + scrollX - cardRect.width - 20;
          }
          break;
        case 'bottom':
          // For save-preview, position closer to buttons
          const spacing = currentCard.id === 'save-preview' ? 10 : 20;
          top = targetRect.bottom + scrollY + spacing;
          left = targetRect.left + scrollX + (targetRect.width / 2) - (cardRect.width / 2);
          break;
        case 'top':
          top = targetRect.top + scrollY - cardRect.height - 20;
          left = targetRect.left + scrollX + (targetRect.width / 2) - (cardRect.width / 2);
          break;
        default:
          // Center as fallback
          top = window.innerHeight / 2 + scrollY - cardRect.height / 2;
          left = window.innerWidth / 2 + scrollX - cardRect.width / 2;
      }

      // Ensure card stays within viewport
      const padding = 20;
      top = Math.max(padding, Math.min(top, window.innerHeight + scrollY - cardRect.height - padding));
      left = Math.max(padding, Math.min(left, window.innerWidth + scrollX - cardRect.width - padding));

      setCardPosition({ top, left });
    };

    // Small delay to ensure card is rendered
    const timeoutId = setTimeout(() => {
      updatePosition();
      // Recalculate arrow position after card is positioned (with a bit more delay for save-preview)
      const arrowDelay = currentCard.id === 'save-preview' ? 100 : 50;
      setTimeout(() => {
        if (cardRef.current && currentCard.arrowTarget) {
          let targetElement: Element | null = null;
          let targetRect: DOMRect | null = null;
          
          // Special handling for save-preview card
          if (currentCard.id === 'save-preview') {
            const topBar = document.querySelector('.builder-top-bar');
            if (topBar) {
              const buttons = Array.from(topBar.querySelectorAll('button'));
              const actionButtons = buttons.filter(btn => {
                const text = btn.textContent?.trim() || '';
                return text === 'Save' || text === 'Preview' || text === 'Apply' || text === 'Saving...';
              });
              
              if (actionButtons.length > 0) {
                // Always create a virtual rect that encompasses all buttons for better accuracy
                const firstRect = actionButtons[0].getBoundingClientRect();
                const lastRect = actionButtons[actionButtons.length - 1].getBoundingClientRect();
                targetRect = {
                  left: firstRect.left,
                  top: firstRect.top,
                  right: lastRect.right,
                  bottom: Math.max(firstRect.bottom, lastRect.bottom),
                  width: lastRect.right - firstRect.left,
                  height: Math.max(firstRect.height, lastRect.height),
                  x: firstRect.left,
                  y: firstRect.top,
                  toJSON: () => ({})
                } as DOMRect;
              } else {
                // Fallback: try to find any button in the top bar's right section
                const rightSection = topBar.querySelector('div[style*="flex: 1"]')?.nextElementSibling;
                if (rightSection) {
                  const fallbackButtons = Array.from(rightSection.querySelectorAll('button'));
                  if (fallbackButtons.length > 0) {
                    targetElement = fallbackButtons[0];
                    targetRect = targetElement.getBoundingClientRect();
                  } else {
                    return; // No buttons found
                  }
                } else {
                  return; // No right section found
                }
              }
            } else {
              return; // Top bar not found
            }
          } else {
            targetElement = document.querySelector(currentCard.arrowTarget);
            if (targetElement) {
              targetRect = targetElement.getBoundingClientRect();
            } else {
              return; // Target element not found
            }
          }
          
          if (targetRect) {
            const cardRect = cardRef.current.getBoundingClientRect();
            
            const targetCenterX = targetRect.left + targetRect.width / 2;
            const targetCenterY = targetRect.top + targetRect.height / 2;

            let arrowTop = '';
            let arrowLeft = '';
            let arrowTransform = '';

            switch (currentCard.arrowPosition) {
              case 'left':
                // For save-preview, ensure arrow points to button center
                if (currentCard.id === 'save-preview') {
                  // Calculate the vertical position to align with button center
                  const arrowVerticalPercent = ((targetCenterY - cardRect.top) / cardRect.height) * 100;
                  arrowLeft = '-22px';
                  arrowTop = `${Math.max(10, Math.min(90, arrowVerticalPercent))}%`; // Clamp between 10% and 90%
                  arrowTransform = 'translateY(-50%)';
                } else {
                  arrowLeft = '-22px';
                  arrowTop = `${((targetCenterY - cardRect.top) / cardRect.height) * 100}%`;
                  arrowTransform = 'translateY(-50%)';
                }
                break;
              case 'right':
                // For save-preview, ensure arrow points to button center
                if (currentCard.id === 'save-preview') {
                  // Calculate the vertical position to align with button center, moved up to land perfectly
                  const arrowVerticalPercent = ((targetCenterY - cardRect.top) / cardRect.height) * 100 - 15; // Move up by 15% to land perfectly
                  arrowLeft = 'calc(100% + 2px)';
                  arrowTop = `${Math.max(10, Math.min(90, arrowVerticalPercent))}%`; // Clamp between 10% and 90%
                  arrowTransform = 'translateY(-50%)';
                } else {
                  arrowLeft = 'calc(100% + 2px)';
                  arrowTop = `${((targetCenterY - cardRect.top) / cardRect.height) * 100}%`;
                  arrowTransform = 'translateY(-50%)';
                }
                break;
              case 'top':
                arrowTop = '-22px';
                arrowLeft = `${((targetCenterX - cardRect.left) / cardRect.width) * 100}%`;
                arrowTransform = 'translateX(-50%)';
                break;
              case 'bottom':
                arrowTop = 'calc(100% + 2px)';
                arrowLeft = `${((targetCenterX - cardRect.left) / cardRect.width) * 100}%`;
                arrowTransform = 'translateX(-50%)';
                break;
            }

            setArrowStyle({
              top: arrowTop || '50%',
              left: arrowLeft || '50%',
              transform: arrowTransform || 'translate(-50%, -50%)',
              visibility: 'visible',
              opacity: 1,
              display: 'flex',
            });
          } else {
            // Fallback positioning if target not found
            const fallbackStyle: React.CSSProperties = {
              visibility: 'visible',
              opacity: 1,
              display: 'flex',
            };
            
            switch (currentCard.arrowPosition) {
              case 'left':
                fallbackStyle.left = '-22px';
                fallbackStyle.top = '50%';
                fallbackStyle.transform = 'translateY(-50%)';
                break;
              case 'right':
                fallbackStyle.left = 'calc(100% + 2px)';
                fallbackStyle.top = '50%';
                fallbackStyle.transform = 'translateY(-50%)';
                break;
              case 'top':
                fallbackStyle.top = '-22px';
                fallbackStyle.left = '50%';
                fallbackStyle.transform = 'translateX(-50%)';
                break;
              case 'bottom':
                fallbackStyle.top = 'calc(100% + 2px)';
                fallbackStyle.left = '50%';
                fallbackStyle.transform = 'translateX(-50%)';
                break;
            }
            
            setArrowStyle(fallbackStyle);
          }
        }
      }, arrowDelay);
    }, 50);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [currentCardIndex, currentCard.arrowTarget, currentCard.cardPosition, currentCard.arrowPosition, showTutorial]);

  const handleNext = () => {
    if (currentCardIndex < tutorialCards.length - 1) {
      setIsTransitioning(true);
      setTransitionDirection('next');
      setLastDirection('next');
      setTimeout(() => {
        setCurrentCardIndex(currentCardIndex + 1);
        // Small delay to ensure new card renders before animating in
        setTimeout(() => {
          setIsTransitioning(false);
          setTransitionDirection(null);
        }, 10);
      }, 200); // Match animation duration
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setIsTransitioning(true);
      setTransitionDirection('prev');
      setLastDirection('prev');
      setTimeout(() => {
        setCurrentCardIndex(currentCardIndex - 1);
        // Small delay to ensure new card renders before animating in
        setTimeout(() => {
          setIsTransitioning(false);
          setTransitionDirection(null);
        }, 10);
      }, 200); // Match animation duration
    }
  };

  const handleClose = () => {
    setShowTutorial(false);
    if (onClose) {
      onClose();
    }
    localStorage.setItem('ziplofy.elementorTutorialSeen', 'true');
  };

  if (!showTutorial) return null;

  const getArrowClass = () => {
    if (!currentCard.arrowPosition) return '';
    return `arrow-${currentCard.arrowPosition}`;
  };

  return (
    <>
      <div className="elementor-tutorial-overlay" onClick={handleClose} />
      <div
        ref={cardRef}
        className={`elementor-tutorial-card contextual ${getArrowClass()} ${
          isTransitioning 
            ? transitionDirection === 'next' 
              ? 'slide-out-left' 
              : 'slide-out-right'
            : lastDirection === 'next'
              ? 'slide-in-from-right'
              : lastDirection === 'prev'
              ? 'slide-in-from-left'
              : 'slide-in'
        }`}
        style={{
          top: `${cardPosition.top}px`,
          left: `${cardPosition.left}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {currentCard.arrowPosition && (
          <div 
            className={`tutorial-arrow arrow-${currentCard.arrowPosition}`}
            style={{
              ...arrowStyle,
              visibility: 'visible',
              opacity: 1,
              display: 'flex',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" style={{ display: 'block' }}>
              {currentCard.arrowPosition === 'left' && (
                <path d="M28 16 L4 16 M8 8 L4 16 L8 24" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              )}
              {currentCard.arrowPosition === 'right' && (
                <path d="M4 16 L28 16 M24 8 L28 16 L24 24" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              )}
              {currentCard.arrowPosition === 'top' && (
                <path d="M16 28 L16 4 M8 12 L16 4 L24 12" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              )}
              {currentCard.arrowPosition === 'bottom' && (
                <path d="M16 4 L16 28 M8 20 L16 28 L24 20" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              )}
            </svg>
          </div>
        )}
        <div className="tutorial-header">
          <div className="tutorial-icon">{currentCard.icon}</div>
          <h2 className="tutorial-title">{currentCard.title}</h2>
          <button className="tutorial-close-btn" onClick={handleClose} aria-label="Close tutorial">
            ✕
          </button>
        </div>

        <div className="tutorial-content">
          <p className="tutorial-description">{currentCard.description}</p>
          
          {currentCard.steps && currentCard.steps.length > 0 && (
            <div className="tutorial-steps">
              <h3 className="steps-title">How to use:</h3>
              <ul className="steps-list">
                {currentCard.steps.map((step, index) => (
                  <li key={index} className="step-item">
                    <span className="step-number">{index + 1}</span>
                    <span className="step-text">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="tutorial-footer">
          <div className="tutorial-progress">
            <span className="progress-text">
              {currentCardIndex + 1} of {tutorialCards.length}
            </span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentCardIndex + 1) / tutorialCards.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="tutorial-navigation">
            <button
              className="tutorial-nav-btn prev"
              onClick={handlePrevious}
              disabled={isFirstCard}
            >
              ← Previous
            </button>
            <button
              className="tutorial-nav-btn next"
              onClick={handleNext}
            >
              {isLastCard ? 'Got it!' : 'Next →'}
            </button>
          </div>
        </div>

        <div className="tutorial-dots">
          {tutorialCards.map((_, index) => (
            <button
              key={index}
              className={`tutorial-dot ${index === currentCardIndex ? 'active' : ''}`}
              onClick={() => setCurrentCardIndex(index)}
              aria-label={`Go to tutorial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ElementorTutorial;
