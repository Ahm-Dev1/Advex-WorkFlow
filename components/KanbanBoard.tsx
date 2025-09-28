import React, { useState, useEffect, useRef } from 'react';
import { Client, ColumnType, Task } from '../types';
import { EMPLOYEES, VISIBLE_COLUMNS, DEFAULT_COLORS } from '../constants';
import Column from './Column';
import TaskModal from './AddTaskModal';
import AssigneeModal from './AssigneeModal';
import AddClientModal from './AddClientModal';
import ConfirmationModal from './ConfirmationModal';
import ColorPicker from './ColorPicker';
import { PlusIcon, ChevronDownIcon, SearchIcon, TrashIcon, PaintBrushIcon } from './icons';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, addDoc, updateDoc, deleteDoc, where, getDocs, writeBatch } from 'firebase/firestore';


const KanbanBoard: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const [expandedClients, setExpandedClients] = useState<Record<string, boolean>>({});
  const [showResolved, setShowResolved] = useState<Record<string, boolean>>({});
  const [draggedItem, setDraggedItem] = useState<{ taskId: string; sourceClientId: string } | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<{ columnId: ColumnType; clientId: string } | null>(null);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [initialClientIdForNewTask, setInitialClientIdForNewTask] = useState<string | undefined>(undefined);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [assignModalState, setAssignModalState] = useState<{ isOpen: boolean; taskId: string | null }>({
    isOpen: false,
    taskId: null,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  
  const [colorPickerState, setColorPickerState] = useState<{ isOpen: boolean; clientId: string | null; position: { top: number, left: number } }>({ isOpen: false, clientId: null, position: {top: 0, left: 0} });
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const [newlyAddedTaskClientIds, setNewlyAddedTaskClientIds] = useState<Set<string>>(new Set());
  const [recentlyUpdatedTaskIds, setRecentlyUpdatedTaskIds] = useState<Set<string>>(new Set());
  const isInitialTaskLoad = useRef(true);
  const tasksRef = useRef<Task[]>([]);

  useEffect(() => {
    const clientQuery = query(collection(db, "clients"));
    const unsubscribeClients = onSnapshot(clientQuery, (snapshot) => {
        const clientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
        setClients(clientsData);
        setExpandedClients(prev => {
          const newExpanded = {...prev};
          clientsData.forEach(c => {
            if(prev[c.id] === undefined) newExpanded[c.id] = true;
          })
          return newExpanded;
        });
    });

    const taskQuery = query(collection(db, "tasks"));
    const unsubscribeTasks = onSnapshot(taskQuery, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        setTasks(tasksData);

        if (isInitialTaskLoad.current) {
            isInitialTaskLoad.current = false;
            tasksRef.current = tasksData;
            return;
        }

        snapshot.docChanges().forEach((change) => {
            const task = { id: change.doc.id, ...change.doc.data() } as Task;

            if (change.type === "added") {
                setNewlyAddedTaskClientIds(prev => new Set(prev).add(task.clientId));
                setTimeout(() => {
                    setNewlyAddedTaskClientIds(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(task.clientId);
                        return newSet;
                    });
                }, 5000);
            }

            if (change.type === "modified") {
                const oldTask = tasksRef.current.find(t => t.id === task.id);
                if (oldTask && oldTask.status !== task.status) {
                    setRecentlyUpdatedTaskIds(prev => new Set(prev).add(task.id));
                    setTimeout(() => {
                        setRecentlyUpdatedTaskIds(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(task.id);
                            return newSet;
                        });
                    }, 3000);
                }
            }
        });
        tasksRef.current = tasksData;
    });

    return () => {
        unsubscribeClients();
        unsubscribeTasks();
    };
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (colorPickerState.isOpen && colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
            setColorPickerState(prev => ({ ...prev, isOpen: false }));
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [colorPickerState.isOpen]);
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string, sourceClientId: string) => {
    setDraggedItem({ taskId, sourceClientId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, columnId: ColumnType, clientId: string) => {
    e.preventDefault();
    if (!dragOverColumn || dragOverColumn.columnId !== columnId || dragOverColumn.clientId !== clientId) {
      setDragOverColumn({ columnId, clientId });
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumnId: ColumnType, targetClientId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.sourceClientId !== targetClientId) {
        setDraggedItem(null);
        setDragOverColumn(null);
        return;
    };
    
    handleUpdateTaskStatus(draggedItem.taskId, targetColumnId);
    setDraggedItem(null);
    setDragOverColumn(null);
  };
  
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: ColumnType) => {
     const taskDocRef = doc(db, 'tasks', taskId);
     await updateDoc(taskDocRef, { status: newStatus });
  };
  
  const handleSaveTask = async (taskData: Omit<Task, 'id'> & { id?: string }) => {
    const { id, ...rest } = taskData;
    if (id) {
        const taskDocRef = doc(db, 'tasks', id);
        await updateDoc(taskDocRef, rest);
    } else {
        await addDoc(collection(db, 'tasks'), rest);
    }
  };

  const requestTaskDeletion = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
    }
  };
  
  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete) return;
    const taskDocRef = doc(db, 'tasks', taskToDelete.id);
    await deleteDoc(taskDocRef);
    setTaskToDelete(null);
  };

  const handleAddClient = async (name: string) => {
    await addDoc(collection(db, 'clients'), { name });
  };
  
  const handleConfirmDeleteClient = async () => {
    if (!clientToDelete) return;
    
    const batch = writeBatch(db);
    const clientDocRef = doc(db, 'clients', clientToDelete.id);
    batch.delete(clientDocRef);
    const tasksQuery = query(collection(db, 'tasks'), where('clientId', '==', clientToDelete.id));
    const tasksSnapshot = await getDocs(tasksQuery);
    tasksSnapshot.forEach(taskDoc => {
        batch.delete(taskDoc.ref);
    });
    
    await batch.commit();
    setClientToDelete(null);
  };

  const handleOpenTaskModalForEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };
  
  const handleOpenTaskModalForCreate = (clientId?: string) => {
    setTaskToEdit(null);
    setInitialClientIdForNewTask(clientId);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setTaskToEdit(null);
    setInitialClientIdForNewTask(undefined);
  };

  const handleOpenAssignModal = (taskId: string) => setAssignModalState({ isOpen: true, taskId });
  const handleCloseAssignModal = () => setAssignModalState({ isOpen: false, taskId: null });

  const handleSaveAssignee = async (assignee: string) => {
    if (!assignModalState.taskId) return;
    const taskDocRef = doc(db, 'tasks', assignModalState.taskId);
    await updateDoc(taskDocRef, { assignee });
    handleCloseAssignModal();
  };
  
  const handleOpenColorPicker = (event: React.MouseEvent, clientId: string) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setColorPickerState({
        isOpen: true,
        clientId,
        position: { top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX - 100 },
    });
  };

  const handleColorChange = async (clientId: string, color: string) => {
    const clientDocRef = doc(db, 'clients', clientId);
    await updateDoc(clientDocRef, { color });
    setColorPickerState(prev => ({ ...prev, isOpen: false }));
  };
  
  const taskToAssign = tasks.find(t => t.id === assignModalState.taskId);

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:max-w-xs">
            <input
                type="text"
                placeholder="ابحث عن عميل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-gray-600 bg-gray-800 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsClientModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 w-full"
            >
              <PlusIcon className="w-5 h-5" />
              <span>عميل جديد</span>
            </button>
            <button
              onClick={() => handleOpenTaskModalForCreate()}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 w-full"
            >
              <PlusIcon className="w-5 h-5" />
              <span>مهمة جديدة</span>
            </button>
        </div>
      </div>

      <div onDragEnd={handleDragEnd}>
        {filteredClients.map((client, index) => {
          const isExpanded = expandedClients[client.id] ?? true;
          const resolvedVisible = showResolved[client.id] ?? false;
          const columnsToDisplay = resolvedVisible ? [...VISIBLE_COLUMNS, ColumnType.RESOLVED] : VISIBLE_COLUMNS;
          const clientColor = client.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
          const clientTasks = tasks.filter(t => t.clientId === client.id);
          const hasNewTask = newlyAddedTaskClientIds.has(client.id);

          return (
            <div key={client.id} className="bg-gray-800/50 rounded-xl shadow-lg mb-8 border-l-4" style={{ borderColor: clientColor }}>
              <div 
                className="flex justify-between items-center cursor-pointer p-4" 
                onClick={() => setExpandedClients(prev => ({...prev, [client.id]: !isExpanded}))}
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-100">{client.name}</h2>
                  {hasNewTask && (
                    <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse-green" title="مهمة جديدة أضيفت"></span>
                  )}
                </div>
                <div className='flex items-center gap-4'>
                    <span className='text-sm font-medium bg-black/20 text-slate-300 rounded-full px-3 py-1'>
                        {clientTasks.filter(t => t.status !== ColumnType.RESOLVED).length} مهام نشطة
                    </span>
                     <button
                        onClick={(e) => handleOpenColorPicker(e, client.id)}
                        className="text-gray-400 hover:text-white p-1 rounded-full transition-colors"
                        aria-label={`تغيير لون العميل ${client.name}`}
                    >
                        <PaintBrushIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setClientToDelete(client);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-full transition-colors"
                        aria-label={`حذف العميل ${client.name}`}
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                    <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-4 pt-0">
                    <div className="flex justify-between items-center mb-4 border-t border-white/10 pt-4">
                      <button
                        onClick={() => setShowResolved(prev => ({...prev, [client.id]: !resolvedVisible}))}
                        className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
                      >
                        {resolvedVisible ? 'إخفاء المهام المكتملة' : 'إظهار المهام المكتملة'}
                      </button>
                       <button
                            onClick={() => handleOpenTaskModalForCreate(client.id)}
                            className="flex items-center gap-1 text-sm px-3 py-1.5 bg-gray-700/70 border border-gray-600 text-slate-200 rounded-md hover:bg-gray-700 transition-colors"
                        >
                            <PlusIcon className="w-4 h-4" />
                            <span>مهمة</span>
                        </button>
                    </div>
                  <div className="flex flex-col md:flex-row gap-4 md:overflow-x-auto pb-4">
                    {columnsToDisplay.map(columnId => (
                      <Column
                        key={columnId}
                        columnId={columnId}
                        title={columnId}
                        tasks={clientTasks.filter(task => task.status === columnId)}
                        onDragStart={(e, taskId) => handleDragStart(e, taskId, client.id)}
                        onDrop={(e, colId) => handleDrop(e, colId, client.id)}
                        onDragOver={(e) => handleDragOver(e, columnId, client.id)}
                        onAssignClick={handleOpenAssignModal}
                        onStatusChange={handleUpdateTaskStatus}
                        onEditTask={handleOpenTaskModalForEdit}
                        onRequestDelete={requestTaskDeletion}
                        isDraggingOver={dragOverColumn?.clientId === client.id && dragOverColumn?.columnId === columnId}
                        recentlyUpdatedTaskIds={recentlyUpdatedTaskIds}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        onSave={handleSaveTask}
        clients={clients}
        taskToEdit={taskToEdit}
        initialClientId={initialClientIdForNewTask}
        employees={EMPLOYEES}
      />

      {taskToAssign && (
        <AssigneeModal 
          isOpen={assignModalState.isOpen}
          onClose={handleCloseAssignModal}
          onSave={handleSaveAssignee}
          employees={EMPLOYEES}
          currentTaskTitle={taskToAssign.title}
          currentAssignee={taskToAssign.assignee}
        />
      )}

      <AddClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onAddClient={handleAddClient}
      />

      <ConfirmationModal 
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        onConfirm={handleConfirmDeleteClient}
        title="تأكيد حذف العميل"
        message={`هل أنت متأكد من رغبتك في حذف العميل "${clientToDelete?.name}"؟ سيتم حذف جميع المهام المرتبطة به بشكل نهائي.`}
      />

      <ConfirmationModal 
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDeleteTask}
        title="تأكيد حذف المهمة"
        message={`هل أنت متأكد من رغبتك في حذف مهمة "${taskToDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
      />
      
      {colorPickerState.isOpen && colorPickerState.clientId && (
        <div ref={colorPickerRef} className="absolute z-50" style={colorPickerState.position}>
            <ColorPicker
              colors={DEFAULT_COLORS}
              currentColor={clients.find(c => c.id === colorPickerState.clientId)?.color || ''}
              onColorSelect={(color) => handleColorChange(colorPickerState.clientId!, color)}
            />
        </div>
      )}
    </>
  );
};

export default KanbanBoard;