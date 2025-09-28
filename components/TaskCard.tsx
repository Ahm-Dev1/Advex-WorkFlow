import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Task, ColumnType } from '../types';
import { UserIcon, EllipsisVerticalIcon, TrashIcon, PencilIcon, ArrowUpCircleIcon } from './icons';

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onAssignClick: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: ColumnType) => void;
  onEditTask: (task: Task) => void;
  onRequestDelete: (taskId: string) => void;
  isRecentlyUpdated: boolean;
}

const statusOptions = Object.values(ColumnType).filter(s => s !== ColumnType.OTHER);

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, onAssignClick, onStatusChange, onEditTask, onRequestDelete, isRecentlyUpdated }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current && !menuButtonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (menuOpen) {
      setMenuOpen(false);
    } else {
      const rect = menuButtonRef.current?.getBoundingClientRect();
      if (rect) {
        setMenuPosition({ top: rect.bottom + 8, left: rect.left });
        setMenuOpen(true);
      }
    }
  };

  const Menu = menuOpen && menuPosition ? createPortal(
    <div 
      ref={menuRef}
      className="fixed mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-50 border border-gray-700"
      style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
    >
      <div className="py-1">
        <span className="block px-4 py-2 text-sm text-gray-400">تغيير الحالة:</span>
        {statusOptions.map(status => (
          <button
            key={status}
            onClick={() => {
              onStatusChange(task.id, status);
              setMenuOpen(false);
            }}
            className="w-full text-right block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
          >
            {status}
          </button>
        ))}
        <div className="border-t border-gray-700 my-1"></div>
        <button
          onClick={() => {
            onRequestDelete(task.id);
            setMenuOpen(false);
          }}
          className="w-full text-right block px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 flex items-center gap-2"
        >
          <TrashIcon className="w-4 h-4" />
          <span>حذف المهمة</span>
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative">
      {Menu}
       {isRecentlyUpdated && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
            <ArrowUpCircleIcon className="w-10 h-10 text-green-400 animate-slide-up-green" />
        </div>
      )}
      <div
        draggable
        onDragStart={(e) => onDragStart(e, task.id)}
        className="bg-gray-800 p-3 mb-3 rounded-lg shadow-md border border-gray-700 cursor-grab active:cursor-grabbing hover:shadow-lg hover:border-indigo-500 transition-all duration-200 group relative"
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-gray-100 pr-2 leading-tight cursor-pointer hover:underline" onClick={() => onEditTask(task)}>{task.title}</h4>
          <div className="relative flex-shrink-0">
            <button 
              ref={menuButtonRef}
              onClick={handleMenuToggle} 
              className="text-gray-500 hover:text-indigo-400"
              aria-label="خيارات المهمة"
            >
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {task.notes && <p className="text-sm text-gray-400 mb-3">{task.notes}</p>}

        <div className="flex items-center justify-between text-sm text-gray-500 mt-3 pt-3 border-t border-gray-700/50">
          {task.timeSpent ? (
            <span className="font-mono text-xs">الوقت: {task.timeSpent}</span>
          ) : <div />}
          <button 
            onClick={() => onAssignClick(task.id)} 
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-indigo-400 flex-shrink-0"
            aria-label="تعيين موظف"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        </div>

        {task.assignee && (
          <div className="flex items-center gap-2 pt-2">
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-gray-400"/>
              </div>
              <span className="text-sm font-medium text-gray-300">{task.assignee}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;