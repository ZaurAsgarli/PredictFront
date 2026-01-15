import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, AlertTriangle, Lock } from 'lucide-react';

const SecurityAlertModal = ({ isOpen, onClose, reason }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-gray-900 border-2 border-red-500 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.3)] relative overflow-hidden"
                >
                    {/* Background Glow */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl" />

                    <div className="relative text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6 relative">
                            <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
                            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                        </div>

                        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
                            Security Alert
                        </h2>
                        <div className="inline-block px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full mb-6 uppercase tracking-widest">
                            Account Temporarily Flagged
                        </div>

                        <p className="text-gray-400 text-sm leading-relaxed mb-8">
                            {reason || "Our Predator AI Defense Engine has detected high-risk activity associated with this request. To protect the ecosystem, this transaction was blocked."}
                        </p>

                        <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700 mb-8 flex items-start gap-3 text-left">
                            <Lock className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <div>
                                <span className="text-xs font-bold text-gray-300 block mb-1 uppercase">Reason for flag:</span>
                                <span className="text-xs text-gray-400">Suspicious trading pattern or automated behavior detected.</span>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-red-500/20"
                        >
                            Understand & Acknowledge
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SecurityAlertModal;
