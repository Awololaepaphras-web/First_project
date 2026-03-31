
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Layout, BookOpen, Users, Coins, Sparkles } from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Welcome to PROPH",
    description: "The ultimate academic node for Nigerian university students. Let's show you around!",
    icon: <Sparkles className="w-12 h-12" />,
    color: "bg-brand-proph"
  },
  {
    title: "Community Feed",
    description: "Connect with students from all over the country. Share updates, ask questions, and stay informed.",
    icon: <Users className="w-12 h-12" />,
    color: "bg-blue-500"
  },
  {
    title: "Study Hub",
    description: "Access a massive library of past questions and academic resources tailored to your university.",
    icon: <BookOpen className="w-12 h-12" />,
    color: "bg-purple-500"
  },
  {
    title: "Earn & Grow",
    description: "Contribute quality content, help others, and earn Proph Coins that you can withdraw or use in-app.",
    icon: <Coins className="w-12 h-12" />,
    color: "bg-yellow-500"
  }
];

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-brand-card w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-brand-border"
      >
        <button 
          onClick={onSkip}
          className="absolute top-6 right-6 p-2 text-brand-muted hover:text-brand-proph transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 pt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className={`w-24 h-24 ${steps[currentStep].color} rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-black/20`}>
                <div className="text-white">
                  {steps[currentStep].icon}
                </div>
              </div>
              
              <h2 className="text-3xl font-black uppercase italic mb-4 dark:text-white">
                {steps[currentStep].title}
              </h2>
              
              <p className="text-brand-muted text-lg leading-relaxed mb-12 px-4">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-brand-proph' : 'w-2 bg-brand-border'}`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <button 
                  onClick={handleBack}
                  className="p-4 bg-brand-border/20 dark:bg-white/5 rounded-2xl text-brand-muted hover:text-brand-proph transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              
              <button 
                onClick={handleNext}
                className="px-8 py-4 bg-brand-proph text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-brand-proph/20"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={onSkip}
          className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted hover:text-brand-proph transition-colors border-t border-brand-border mt-4"
        >
          Skip Tutorial
        </button>
      </motion.div>
    </div>
  );
};

export default OnboardingTutorial;
