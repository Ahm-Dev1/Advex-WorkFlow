import React, { useState, useEffect } from 'react';
import { CloseIcon, UserIcon } from './icons';

interface AssigneeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignee: string) => void;
  employees: string[];
  currentTaskTitle: string;
  currentAssignee?: string;
}

const AssigneeModal: React.FC<AssigneeModalProps> = ({ 
  isOpen, onClose, onSave, employees, currentTaskTitle, currentAssignee 
}) => {
  const [selectedAssignee, setSelectedAssignee] = useState(currentAssignee || '');

  useEffect(() => {
    setSelectedAssignee(currentAssignee || '');
  }, [currentAssignee, isOpen]);

  const handleSave = () => {
    onSave(selectedAssignee);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-sm m-4 p-6 relative border border-gray-700">
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-200" aria-label="إغلاق">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold mb-2 text-gray-100">تعيين موظف</h2>
        <p className="text-sm text-gray-400 mb-6">للمهمة: <span className="font-semibold text-gray-300">{currentTaskTitle}</span></p>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {employees.map(employee => (
            <label 
              key={employee} 
              className={`flex items-center gap-3 p-3 rounded-md cursor-pointer border-2 transition-colors ${
                selectedAssignee === employee ? 'border-indigo-500 bg-indigo-500/10' : 'border-transparent hover:bg-gray-700'
              }`}
            >
              <input
                type="radio"
                name="assignee"
                value={employee}
                checked={selectedAssignee === employee}
                onChange={() => setSelectedAssignee(employee)}
                className="hidden"
              />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedAssignee === employee ? 'bg-indigo-500 text-white' : 'bg-gray-600 text-gray-200'}`}>
                <UserIcon className="w-6 h-6" />
              </div>
              <span className="font-medium text-gray-200">{employee}</span>
            </label>
          ))}
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
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400/50 disabled:cursor-not-allowed"
            disabled={!selectedAssignee}
          >
            حفظ التعيين
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssigneeModal;