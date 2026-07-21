import React from 'react';

export interface Goal {
  id: string;
  title: string;
  categories: string[];
  progress: number; // 0-100
  color?: 'cyan' | 'orange';
}

interface GoalItemProps {
  goal: Goal;
}

const GoalItem: React.FC<GoalItemProps> = ({ goal }) => {
  const progressColor =
    goal.color === 'orange'
      ? 'bg-orange-500'
      : 'bg-cyan-500'; // Default to cyan/turquoise

  return (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      {/* Title and Categories */}
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-gray-900 mb-1">{goal.title}</h4>
        <div className="flex items-center gap-2 flex-wrap">
          {goal.categories.map((category, index) => (
            <React.Fragment key={index}>
              <span className="text-xs text-gray-500">{category}</span>
              {index < goal.categories.length - 1 && (
                <span className="text-xs text-gray-400">•</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Progress Bar and Percentage */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} transition-all duration-300`}
            style={{ width: `${goal.progress}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gray-900 min-w-[40px] text-right">
          {goal.progress}%
        </span>
      </div>
    </div>
  );
};

export default GoalItem;

    