import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import React from 'react';
import TaskItem, { Task } from './TaskItem';

export type TaskStatus = 'in-progress' | 'to-do' | 'upcoming';

interface TaskSectionProps {
  status: TaskStatus;
  tasks: Task[];
  isExpanded: boolean;
  onToggle: () => void;
  onTaskToggle?: (taskId: string) => void;
  onTaskCheck?: (taskId: string) => void;
}

const TaskSection: React.FC<TaskSectionProps> = ({
  status,
  tasks,
  isExpanded,
  onToggle,
  onTaskToggle,
  onTaskCheck,
}) => {
  const getStatusStyles = (status: TaskStatus) => {
    switch (status) {
      case 'in-progress':
        return 'bg-teal-100 text-teal-700';
      case 'to-do':
        return 'bg-gray-100 text-gray-700';
      case 'upcoming':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'in-progress':
        return 'IN PROGRESS';
      case 'to-do':
        return 'TO DO';
      case 'upcoming':
        return 'UPCOMING';
      default:
        return status.toUpperCase();
    }
  };

  return (
    <div className="mb-4">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          )}
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyles(
              status
            )}`}
          >
            {getStatusLabel(status)}
          </span>
          <span className="text-sm text-gray-500">• {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
        </div>
      </button>

      {/* Tasks List */}
      {isExpanded && tasks.length > 0 && (
        <div className="ml-8 mt-2">
          {/* Column Headers */}
          <div className="flex items-center gap-3 pb-2 mb-2 border-b border-gray-200">
            <div className="flex-1 text-left">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</span>
            </div>
            <div className="w-24 text-center">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</span>
            </div>
            <div className="w-32 text-right">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Due date</span>
            </div>
          </div>

          {/* Task Items */}
          <div>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onTaskToggle}
                onCheck={onTaskCheck}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskSection;

