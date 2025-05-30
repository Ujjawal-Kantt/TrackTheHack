import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { X } from "lucide-react";
import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed z-50 inset-0 flex items-center justify-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div
              className="bg-dark-100 border border-gray-800 rounded-xl shadow-lg glassmorphism p-6 w-[90%] max-w-md relative text-white"
              onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicked inside
            >
              {/* Close icon */}
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-200"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              {/* Title & Message */}
              <h2 className="text-lg font-semibold mb-2">{title}</h2>
              <p className="text-sm text-gray-400">{message}</p>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  className="border-gray-700 hover:bg-dark-300 text-gray-300"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
