import React from 'react';
import { Task, ColumnType } from '../types';
import TaskCard from './TaskCard';

interface ColumnProps {
  columnId: ColumnType;
  title: string;
  tasks: Task[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, columnId: ColumnType) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onAssignClick: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: ColumnType) => void;
  onEditTask: (task: Task) => void;
  onRequestDelete: (taskId: string) => void;
  isDraggingOver: boolean;
  recentlyUpdatedTaskIds: Set<string>;
}

const Column: React.FC<ColumnProps> = ({ 
  columnId, title, tasks, onDragStart, onDrop, onDragOver, onAssignClick, onStatusChange, onEditTask, onRequestDelete, isDraggingOver, recentlyUpdatedTaskIds
}) => {
  
  const getHeaderColor = () => {
    const colors: { [key:string]: string } = {
        [ColumnType.UNASSIGNED]: 'border-red-400',
        [ColumnType.IN_PROGRESS]: 'border-blue-400',
        [ColumnType.ON_HOLD]: 'border-yellow-400',
        [ColumnType.RESOLVED]: 'border-green-400',
        [ColumnType.OTHER]: 'border-gray-500'
    };
    return colors[title] || 'border-gray-500';
  };

  return (
    <div
      className="w-full md:w-[320px] md:flex-shrink-0 rounded-xl bg-gray-900/60 flex flex-col max-h-[calc(100vh-20rem)]"
      onDrop={(e) => onDrop(e, columnId)}
      onDragOver={onDragOver}
    >
      <div className={`p-4 border-t-4 ${getHeaderColor()} rounded-t-xl flex-shrink-0`}>
        <h3 className="text-lg font-bold text-gray-200 flex justify-between items-center">
          {title}
          <span className="text-sm font-medium bg-gray-700 text-gray-300 rounded-full px-3 py-1">
            {tasks.length}
          </span>
        </h3>
      </div>
      <div className={`p-2 overflow-y-auto transition-colors duration-300 ${isDraggingOver ? 'bg-gray-700/30' : ''}`}>
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onDragStart={onDragStart} 
            onAssignClick={onAssignClick}
            onStatusChange={onStatusChange}
            onEditTask={onEditTask}
            onRequestDelete={onRequestDelete}
            isRecentlyUpdated={recentlyUpdatedTaskIds.has(task.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Column;