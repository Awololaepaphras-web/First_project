import React, { useState, useEffect } from 'react';
import { 
  X, ChevronRight, ChevronLeft, Brain, 
  Database, Swords, Wallet, Megaphone,
  CheckCircle2, Sparkles, Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const steps: TutorialStep[] = [
  {
    title: "Welcome to Proph",
    description: "The federal grid for academic intel and student monetization. Let's show you how to navigate the mainframe.",
    icon: <Sparkles className="w-12 h-12" />,
    color: "bg-brand-proph"
  },
  {
    title: "Scholar Mainframe",
    description: "Your central hub. Access AI Study Buddy, Memory Bank, and your financial status from here.",
    icon: <Brain className="w-12 h-12" />,
    color: "bg-emerald-500"
  },
  {
    title: "Memory Bank",
    description: "Access and contribute verified past questions and handouts. Earn Prophy Coins for every approved upload.",
    icon: <Database className="w-12 h-12" />,
    color: "bg-purple-500"
  },
  {
    title: "Gladiator Hub",
    description: "Challenge peers in academic duels. Commit coins to the pool and win big based on your performance.",
    icon: <Swords className="w-12 h-12" />,
    color: "bg-green-600"
  },
  {
    title: "Financial Hub",
    description: "Convert your earned Prophy Coins into real-world bounties. Track your ad revenue share and withdrawal status.",
    icon: <Wallet className="w-12 h-12" />,
    color: "bg-yellow-500"
  },
  {
    title: "Ad Engine",
    description: "Deploy your own ads or earn from global ad revenue. The more active you are, the higher your share.",
    icon: <Megaphone className="w-12 h-12" />,
    color: "bg-blue-500"
  }
];

const Tutorial: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-brand-card w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl border border-brand-border relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-12 space-y-8">
          <div className="flex justify-center">
            <motion.div 
              key={currentStep}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`p-8 rounded-[2.5rem] ${steps[currentStep].color} text-black shadow-xl`}
            >
              {steps[currentStep].icon}
            </motion.div>
          </div>

          <div className="text-center space-y-4">
            <motion.h2 
              key={`title-${currentStep}`}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-3xl font-black uppercase italic tracking-tighter"
            >
              {steps[currentStep].title}
            </motion.h2>
            <motion.p 
              key={`desc-${currentStep}`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-brand-muted font-medium italic leading-relaxed"
            >
              {steps[currentStep].description}
            </motion.p>
          </div>

          <div className="flex items-center justify-between pt-8">
            <button 
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 font-black uppercase tracking-widest text-xs transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'hover:text-brand-proph'}`}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex gap-2">
              {steps.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${idx === currentStep ? 'w-8 bg-brand-proph' : 'w-2 bg-brand-border'}`}
                />
              ))}
            </div>

            <button 
              onClick={nextStep}
              className="flex items-center gap-2 bg-black dark:bg-white dark:text-black text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-brand-proph/10 p-6 border-t border-brand-border flex items-center justify-center gap-3">
          <Navigation className="w-4 h-4 text-brand-proph" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-proph">Proph Onboarding Protocol v1.0</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Tutorial;
