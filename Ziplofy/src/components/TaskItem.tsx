import { ChevronDownIcon } from '@heroicons/react/24/outline';
import React from 'react';

export interface Task {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  isExpanded?: boolean;
}

interface TaskItemProps {
  task: Task;
  onToggle?: (taskId: string) => void;
  onCheck?: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onCheck }) => {
  const getPriorityStyles = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(date);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `${diffDays} days left`;
    if (diffDays === -1) return 'Yesterday';
    return `${Math.abs(diffDays)} days ago`;
  };

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-3 py-3">
        {/* Caret and Checkbox */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggle?.(task.id)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronDownIcon className="w-4 h-4 text-gray-500" />
          </button>
          <input
            type="checkbox"
            onChange={() => onCheck?.(task.id)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        {/* Task Name */}
        <div className="flex-1">
          <span className="text-sm text-gray-900">{task.name}</span>
        </div>

        {/* Priority */}
        <div className="w-24 text-center">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityStyles(
              task.priority
            )}`}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>

        {/* Due Date */}
        <div className="w-32 text-right">
          <span className="text-sm text-gray-600">{formatDueDate(task.dueDate)}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;

