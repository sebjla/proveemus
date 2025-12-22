
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from './icons/XIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDestructive ? 'text-red-600' : 'text-gray-900'}`}>
                {title}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              {message}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`px-4 py-2 text-white font-medium rounded-lg shadow-sm flex items-center transition-colors disabled:opacity-50
                  ${isDestructive 
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                    : 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500'
                  }`}
              >
                {isLoading && <SpinnerIcon className="w-4 h-4 mr-2" />}
                {confirmText}
              </button>
            </div>
          </div>
          
          {isDestructive && (
             <div className="h-1.5 w-full bg-red-100">
                <div className="h-full bg-red-500 w-full" />
             </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
