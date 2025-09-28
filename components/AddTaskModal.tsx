import React, { useState, useEffect } from 'react';
import { ColumnType, Task, Client } from '../types';
import { CloseIcon } from './icons';
import { EMPLOYEES } from '../constants';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id'> & { id?: string }) => void;
  clients: Client[];
  taskToEdit?: Task | null;
  initialClientId?: string;
  employees: string[];
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, clients, taskToEdit, initialClientId, employees }) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ColumnType>(ColumnType.UNASSIGNED);
  const [timeSpent, setTimeSpent] = useState('');
  const [assignee, setAssignee] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState(initialClientId || clients[0]?.id || '');
  
  const isEditing = !!taskToEdit;

  useEffect(() => {
    if (isOpen) {
      if (isEditing && taskToEdit) {
        setTitle(taskToEdit.title);
        setNotes(taskToEdit.notes);
        setStatus(taskToEdit.status);
        setTimeSpent(taskToEdit.timeSpent || '');
        setAssignee(taskToEdit.assignee || '');
        setSelectedClientId(taskToEdit.clientId);
      } else {
        setTitle('');
        setNotes('');
        setStatus(ColumnType.UNASSIGNED);
        setTimeSpent('');
        setAssignee('');
        setSelectedClientId(initialClientId || clients[0]?.id || '');
      }
    }
  }, [isOpen, taskToEdit, isEditing, clients, initialClientId]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && selectedClientId) {
      onSave({
        id: taskToEdit?.id,
        title,
        notes,
        status,
        timeSpent,
        assignee,
        clientId: selectedClientId,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 p-6 relative border border-gray-700">
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-200">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-100">{isEditing ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && clients.length > 0 && (
             <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-300 mb-1">
                العميل
              </label>
              <select
                id="client"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              عنوان المهمة
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">
              ملاحظات
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
                <label htmlFor="assignee" className="block text-sm font-medium text-gray-300 mb-1">
                  الموظف المسؤول
                </label>
                <select
                  id="assignee"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">غير معين</option>
                  {employees.map(emp => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))}
                </select>
              </div>
            <div>
              <label htmlFor="column" className="block text-sm font-medium text-gray-300 mb-1">
                الحالة
              </label>
              <select
                id="column"
                value={status}
                onChange={(e) => setStatus(e.target.value as ColumnType)}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {Object.values(ColumnType).filter(s => s !== ColumnType.OTHER).map(colId => (
                  <option key={colId} value={colId}>{colId}</option>
                ))}
              </select>
            </div>
           
          </div>
           <div>
              <label htmlFor="timeSpent" className="block text-sm font-medium text-gray-300 mb-1">
                الوقت المستغرق
              </label>
              <input
                type="text"
                id="timeSpent"
                placeholder='مثال: 5 ساعات'
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          <div className="flex justify-end space-x-reverse space-x-2 pt-4">
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
              {isEditing ? 'حفظ التعديلات' : 'إضافة المهمة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;