import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ShoppingCartIcon,
  CubeIcon,
  UserGroupIcon,
  TagIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  XMarkIcon,
  CheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
  targetPath?: string;
  position: 'center' | 'right' | 'bottom' | 'bottom-right';
  action?: 'click' | 'next';
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Ziplofy! 🎉',
    description: "We're excited to have you here! Let's take a quick tour to help you get started with managing your store.",
    icon: <SparklesIcon className="w-7 h-7" />,
    position: 'center',
    action: 'next',
  },
  {
    id: 'home',
    title: 'Dashboard Overview',
    description: 'This is your home dashboard. View your sales, revenue, and key metrics at a glance.',
    icon: <HomeIcon className="w-5 h-5" />,
    targetSelector: '[data-tour-id="nav-home"]',
    targetPath: '/',
    position: 'right',
    action: 'next',
  },
  {
    id: 'products',
    title: 'Manage Products',
    description: 'Add products, manage inventory, create collections, and organize your entire catalog.',
    icon: <CubeIcon className="w-5 h-5" />,
    targetSelector: '[data-tour-id="nav-products"]',
    targetPath: '/products',
    position: 'right',
    action: 'next',
  },
  {
    id: 'orders',
    title: 'Handle Orders',
    description: 'Process customer orders, manage fulfillment, handle returns, and track shipments.',
    icon: <ShoppingCartIcon className="w-5 h-5" />,
    targetSelector: '[data-tour-id="nav-orders"]',
    targetPath: '/orders',
    position: 'right',
    action: 'next',
  },
  {
    id: 'customers',
    title: 'Customer Management',
    description: 'View customer details, create segments, and build lasting relationships with your buyers.',
    icon: <UserGroupIcon className="w-5 h-5" />,
    targetSelector: '[data-tour-id="nav-customers"]',
    targetPath: '/customers',
    position: 'right',
    action: 'next',
  },
  {
    id: 'discounts',
    title: 'Create Discounts',
    description: 'Set up discount codes, automatic promotions, and special offers to boost your sales.',
    icon: <TagIcon className="w-5 h-5" />,
    targetSelector: '[data-tour-id="nav-discounts"]',
    targetPath: '/discounts',
    position: 'right',
    action: 'next',
  },
  {
    id: 'analytics',
    title: 'View Analytics',
    description: 'Track your store performance with detailed reports and real-time analytics.',
    icon: <ChartBarIcon className="w-5 h-5" />,
    targetSelector: '[data-tour-id="nav-analytics"]',
    targetPath: '/analytics',
    position: 'right',
    action: 'next',
  },
  {
    id: 'settings',
    title: 'Store Settings',
    description: 'Configure payments, shipping, taxes, domains, and customize your store experience.',
    icon: <Cog6ToothIcon className="w-5 h-5" />,
    targetSelector: '[data-tour-id="nav-settings"]',
    targetPath: '/settings/general',
    position: 'right',
    action: 'next',
  },
  {
    id: 'complete',
    title: "You're All Set! 🚀",
    description: "Congratulations! You now know your way around Ziplofy. Start building your successful online business!",
    icon: <CheckIcon className="w-7 h-7" />,
    position: 'center',
    action: 'next',
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
}

interface TooltipPosition {
  top: number;
  left: number;
  arrowPosition: 'left' | 'top' | 'none';
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('ziplofy_onboarding_step');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isVisible, setIsVisible] = useState(true);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ top: 0, left: 0, arrowPosition: 'none' });
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const calculatePosition = useCallback(() => {
    if (!step.targetSelector) {
      setTargetRect(null);
      setTooltipPosition({ top: 0, left: 0, arrowPosition: 'none' });
      return;
    }

    const target = document.querySelector(step.targetSelector);
    if (!target) {
      setTargetRect(null);
      return;
    }

    const rect = target.getBoundingClientRect();
    setTargetRect(rect);

    const tooltipWidth = 340;
    const tooltipHeight = 220;
    const padding = 16;
    const arrowOffset = 20;

    let top = rect.top + rect.height / 2 - tooltipHeight / 2;
    let left = rect.right + padding;
    let arrowPosition: 'left' | 'top' | 'none' = 'left';

    if (left + tooltipWidth > window.innerWidth - padding) {
      left = rect.left - tooltipWidth - padding;
      arrowPosition = 'left';
    }

    if (top < padding) {
      top = padding;
    } else if (top + tooltipHeight > window.innerHeight - padding) {
      top = window.innerHeight - tooltipHeight - padding;
    }

    if (step.position === 'bottom' || step.position === 'bottom-right') {
      top = rect.bottom + padding + arrowOffset;
      left = rect.left;
      arrowPosition = 'top';
    }

    setTooltipPosition({ top, left, arrowPosition });
  }, [step]);

  useEffect(() => {
    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition);

    const timeout = setTimeout(calculatePosition, 100);

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
      clearTimeout(timeout);
    };
  }, [calculatePosition, currentStep]);

  useEffect(() => {
    localStorage.setItem('ziplofy_onboarding_step', currentStep.toString());
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      const nextStep = tourSteps[currentStep + 1];
      if (nextStep.targetPath && location.pathname !== nextStep.targetPath) {
        navigate(nextStep.targetPath);
      }
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, location.pathname, navigate]);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, []);

  const handleComplete = useCallback(() => {
    setIsVisible(false);
    localStorage.removeItem('ziplofy_onboarding_step');
    setTimeout(() => {
      localStorage.setItem('ziplofy_onboarding_complete', 'true');
      onComplete();
    }, 300);
  }, [onComplete]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep((prev) => prev - 1);
      }
    },
    [handleNext, handleSkip, currentStep]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const isCentered = step.position === 'center' || !step.targetSelector;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop with proper cutout for target element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9998] pointer-events-none"
            style={{
              background: 'rgba(0,0,0,0.75)',
              clipPath: targetRect
                ? `polygon(
                    0% 0%, 
                    0% 100%, 
                    ${targetRect.left - 8}px 100%, 
                    ${targetRect.left - 8}px ${targetRect.top - 8}px, 
                    ${targetRect.right + 8}px ${targetRect.top - 8}px, 
                    ${targetRect.right + 8}px ${targetRect.bottom + 8}px, 
                    ${targetRect.left - 8}px ${targetRect.bottom + 8}px, 
                    ${targetRect.left - 8}px 100%, 
                    100% 100%, 
                    100% 0%
                  )`
                : 'none',
            }}
          />

          {/* Blue border highlight around the cutout */}
          {targetRect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="fixed z-[9999] pointer-events-none"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                borderRadius: '12px',
                border: '3px solid #3b82f6',
                boxShadow: '0 0 20px 4px rgba(59, 130, 246, 0.5), inset 0 0 20px 4px rgba(59, 130, 246, 0.1)',
                background: 'transparent',
              }}
            />
          )}

          {/* Animated pulsing ring */}
          {targetRect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="fixed z-[9997] pointer-events-none"
              style={{
                top: targetRect.top - 12,
                left: targetRect.left - 12,
                width: targetRect.width + 24,
                height: targetRect.height + 24,
                borderRadius: '16px',
                border: '2px solid rgba(59, 130, 246, 0.6)',
                background: 'transparent',
              }}
            />
          )}



          {/* Tour Tooltip */}
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9, y: isCentered ? 20 : 0, x: isCentered ? 0 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-[10000]"
            style={
              isCentered
                ? { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
                : { top: tooltipPosition.top, left: tooltipPosition.left }
            }
          >
            <div className="relative bg-white rounded-2xl shadow-2xl w-[340px] overflow-hidden">
              {/* Arrow pointing to target */}
              {!isCentered && tooltipPosition.arrowPosition === 'left' && (
                <div
                  className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0"
                  style={{
                    borderTop: '10px solid transparent',
                    borderBottom: '10px solid transparent',
                    borderRight: '10px solid white',
                  }}
                />
              )}
              {!isCentered && tooltipPosition.arrowPosition === 'top' && (
                <div
                  className="absolute left-8 -top-2 w-0 h-0"
                  style={{
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderBottom: '10px solid white',
                  }}
                />
              )}

              {/* Progress Bar */}
              <div className="h-1 bg-gray-100">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Header with step counter and close */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    {tourSteps.map((_, index) => (
                      <motion.div
                        key={index}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          index === currentStep
                            ? 'w-5 bg-blue-500'
                            : index < currentStep
                            ? 'w-1.5 bg-blue-300'
                            : 'w-1.5 bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleSkip}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Icon */}
                <motion.div
                  key={step.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    step.id === 'welcome' || step.id === 'complete'
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {step.icon}
                </motion.div>

                {/* Text */}
                <motion.div
                  key={`content-${step.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">{step.description}</p>
                </motion.div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleSkip}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Skip tour
                  </button>

                  <div className="flex items-center gap-2">
                    {currentStep > 0 && (
                      <motion.button
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => {
                          const prevStep = tourSteps[currentStep - 1];
                          if (prevStep.targetPath) {
                            navigate(prevStep.targetPath);
                          }
                          setCurrentStep((prev) => prev - 1);
                        }}
                        className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Back
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNext}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
                    >
                      {currentStep === tourSteps.length - 1 ? (
                        <>
                          <CheckIcon className="w-3.5 h-3.5" />
                          Get Started
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRightIcon className="w-3.5 h-3.5" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Decorative gradient */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Floating decorations for centered steps */}
            {isCentered && (
              <>
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-lg shadow-lg"
                >
                  ✨
                </motion.div>
                <motion.div
                  animate={{ y: [0, 8, 0], rotate: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -bottom-4 -left-4 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-base shadow-lg"
                >
                  🚀
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Keyboard Hints */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-4 text-white/50 text-xs"
          >
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">←</kbd>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">→</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">Esc</kbd>
              Skip
            </span>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OnboardingTour;
