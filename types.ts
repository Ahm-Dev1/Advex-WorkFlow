
// FIX: Removed faulty import of 'Task' from a non-existent file and defined the interface here.
// This resolves module resolution errors in components that depend on the Task type.
export enum ColumnType {
  UNASSIGNED = 'لم يتم تعيين مراجع',
  IN_PROGRESS = 'جاري العمل عليها',
  ON_HOLD = 'معلقة',
  RESOLVED = 'تم حلها',
  OTHER = 'أخرى',
}

export interface Task {
  id: string;
  clientId: string;
  title: string;
  notes: string;
  status: ColumnType;
  assignee?: string;
  timeSpent?: string;
}

export interface Client {
  id:string;
  name: string;
  color?: string;
}