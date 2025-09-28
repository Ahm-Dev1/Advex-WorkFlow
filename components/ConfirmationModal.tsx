import React from 'react';
import { CloseIcon, ExclamationTriangleIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, onClose, onConfirm, title, message 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 p-6 relative border border-gray-700">
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-200" aria-label="إغلاق">
          <CloseIcon className="w-6 h-6" />
        </button>
        
        <div className="flex items-start gap-4">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 sm:mx-0">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
          </div>
          <div className="mt-0 text-center sm:text-right">
            <h3 className="text-lg leading-6 font-bold text-gray-100" id="modal-title">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-400">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-reverse space-x-2 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
          >
            تأكيد الحذف
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;