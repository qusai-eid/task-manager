import { Task } from '../../types';
import TaskCard from './TaskCard';
import { CheckSquare } from 'lucide-react';

interface Props {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (task: Task, status: Task['status']) => void;
}

export default function TaskList({ tasks, onEdit, onDelete, onStatusChange }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <CheckSquare className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-lg font-medium">No tasks found</p>
        <p className="text-sm mt-1">Create your first task to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
