
import React from 'react';
import { X, Shield, Scale, Eye, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-brand-card border border-brand-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-6 sm:p-8 border-b border-brand-border flex items-center justify-between bg-brand-black/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-proph/10 rounded-xl">
                  <Shield className="w-6 h-6 text-brand-proph" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Protocol & Privacy</h2>
                  <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Version 1.0.4 - Academic Integrity</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-brand-muted hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 custom-scrollbar">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-brand-proph">
                  <Scale className="w-4 h-4" />
                  <h3 className="text-xs font-black uppercase tracking-widest">1. Academic Integrity</h3>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed font-medium">
                  Prophy is a decentralized academic archive. Users are strictly prohibited from uploading copyrighted examination materials without authorization. All contributions must adhere to the institutional policies of your respective Federal University.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-brand-proph">
                  <Lock className="w-4 h-4" />
                  <h3 className="text-xs font-black uppercase tracking-widest">2. Data Sovereignty</h3>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed font-medium">
                  Your identity is synced across the Federal Node. We store your institutional email, name, and academic level solely for verification and peer-to-peer collaboration. We do not sell your data to third-party entities.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-brand-proph">
                  <Eye className="w-4 h-4" />
                  <h3 className="text-xs font-black uppercase tracking-widest">3. Community Conduct</h3>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed font-medium">
                  Harassment, hate speech, or the distribution of malicious software within the sync network will result in immediate termination of your Proph ID and blacklisting across all institutional nodes.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-brand-proph">
                  <Shield className="w-4 h-4" />
                  <h3 className="text-xs font-black uppercase tracking-widest">4. Coin Economy</h3>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed font-medium">
                  Prophy Coins are a utility token for academic exchange. They hold no real-world monetary value outside the platform's ecosystem. Manipulation of the coin system via exploits is a violation of the protocol.
                </p>
              </section>

              <div className="p-6 bg-brand-proph/5 border border-brand-proph/10 rounded-3xl">
                <p className="text-[10px] font-bold text-brand-proph leading-relaxed italic uppercase text-center">
                  By syncing your identity, you acknowledge that you are a verified student of a Federal University and agree to uphold the standards of academic excellence.
                </p>
              </div>
            </div>

            <div className="p-6 bg-brand-black/50 border-t border-brand-border flex justify-end">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-brand-proph text-black font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg"
              >
                I Understand
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PolicyModal;
