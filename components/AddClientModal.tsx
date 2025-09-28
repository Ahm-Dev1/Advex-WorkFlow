import React, { useState } from 'react';
import { CloseIcon } from './icons';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (name: string) => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onAddClient }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddClient(name.trim());
      setName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 p-6 relative border border-gray-700">
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-200">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-100">إضافة عميل جديد</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="client-name" className="block text-sm font-medium text-gray-300 mb-1">
              اسم العميل
            </label>
            <input
              type="text"
              id="client-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end space-x-reverse space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
            >
              إضافة العميل
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientModal;