import {
  PlusIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useState } from 'react';
import TaskSection, { TaskStatus } from './TaskSection';
import { Task } from './TaskItem';

interface MyTaskCardProps {
  tasks?: {
    'in-progress': Task[];
    'to-do': Task[];
    upcoming: Task[];
  };
  onAddTask?: () => void;
}

const MyTaskCard: React.FC<MyTaskCardProps> = ({
  tasks = {
    'in-progress': [
      {
        id: '1',
        name: 'One-on-One Meeting',
        priority: 'high',
        dueDate: new Date().toISOString().split('T')[0], // Today
      },
      {
        id: '2',
        name: 'Send a summary email to stakeholders',
        priority: 'low',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
      },
    ],
    'to-do': [
      {
        id: '3',
        name: 'Review project proposal',
        priority: 'medium',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    ],
    upcoming: [
      {
        id: '4',
        name: 'Team standup meeting',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    ],
  },
  onAddTask,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<TaskStatus, boolean>>({
    'in-progress': true,
    'to-do': false,
    upcoming: false,
  });

  const handleSectionToggle = useCallback((status: TaskStatus) => {
    setExpandedSections((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  }, []);

  const handleTaskToggle = useCallback((taskId: string) => {
    // Handle task expansion if needed
    console.log('Toggle task:', taskId);
  }, []);

  const handleTaskCheck = useCallback((taskId: string) => {
    // Handle task completion
    console.log('Check task:', taskId);
  }, []);

  const handleAddTask = useCallback(() => {
    if (onAddTask) {
      onAddTask();
    } else {
      console.log('Add task clicked');
    }
  }, [onAddTask]);

  const handleExpand = useCallback(() => {
    console.log('Expand clicked');
  }, []);

  const handleMenuClick = useCallback(() => {
    console.log('Menu clicked');
  }, []);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">My Task</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddTask}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Add task"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleExpand}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Expand"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
              />
            </svg>
          </button>
          <button
            onClick={handleMenuClick}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="More options"
          >
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Task Sections */}
      <div>
        {/* IN PROGRESS Section */}
        <TaskSection
          status="in-progress"
          tasks={tasks['in-progress']}
          isExpanded={expandedSections['in-progress']}
          onToggle={() => handleSectionToggle('in-progress')}
          onTaskToggle={handleTaskToggle}
          onTaskCheck={handleTaskCheck}
        />

        {/* Add Task Button (after IN PROGRESS if expanded) */}
        {expandedSections['in-progress'] && (
          <button
            onClick={handleAddTask}
            className="flex items-center gap-2 ml-8 mb-4 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add task</span>
          </button>
        )}

        {/* TO DO Section */}
        <TaskSection
          status="to-do"
          tasks={tasks['to-do']}
          isExpanded={expandedSections['to-do']}
          onToggle={() => handleSectionToggle('to-do')}
          onTaskToggle={handleTaskToggle}
          onTaskCheck={handleTaskCheck}
        />

        {/* UPCOMING Section */}
        <TaskSection
          status="upcoming"
          tasks={tasks.upcoming}
          isExpanded={expandedSections.upcoming}
          onToggle={() => handleSectionToggle('upcoming')}
          onTaskToggle={handleTaskToggle}
          onTaskCheck={handleTaskCheck}
        />
      </div>
    </div>
  );
};

export default MyTaskCard;

