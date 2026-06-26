import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskStatus } from '../../types';
import TaskCard from './TaskCard';
import { CheckSquare } from 'lucide-react';

interface Props {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onOpen: (task: Task) => void;
}

export default function TaskList({ tasks, onEdit, onDelete, onStatusChange, onOpen }: Props) {
  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20"
        style={{ color: 'var(--text-3)' }}
      >
        <CheckSquare className="w-14 h-14 mb-4 opacity-30" />
        <p className="text-base font-semibold">No tasks found</p>
        <p className="text-sm mt-1 opacity-70">Try adjusting your filters</p>
      </motion.div>
    );
  }

  return (
    <motion.div layout className="space-y-2">
      <AnimatePresence mode="popLayout">
        {tasks.map((task, i) => (
          <motion.div key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}>
            <TaskCard task={task} onEdit={onEdit} onDelete={onDelete}
              onStatusChange={onStatusChange} onOpen={onOpen} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
