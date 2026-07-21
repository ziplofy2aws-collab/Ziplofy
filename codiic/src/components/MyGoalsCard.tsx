import React from 'react';
import GoalItem, { Goal } from './GoalItem';

interface MyGoalsCardProps {
  goals?: Goal[];
}

const MyGoalsCard: React.FC<MyGoalsCardProps> = ({
  goals = [
    {
      id: '1',
      title: 'Check Emails and Messages',
      categories: ['Product launch', 'My Projects'],
      progress: 73,
      color: 'cyan',
    },
    {
      id: '2',
      title: 'Prepare a brief status update to the client',
      categories: ['Product launch', 'My Projects'],
      progress: 11,
      color: 'orange',
    },
    {
      id: '3',
      title: 'Update project documentation',
      categories: ['Team brainstorm', 'My Projects'],
      progress: 63,
      color: 'cyan',
    },
  ],
}) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">My Goals</h3>
      </div>

      {/* Goals List */}
      <div className="space-y-0">
        {goals.map((goal) => (
          <GoalItem key={goal.id} goal={goal} />
        ))}
      </div>
    </div>
  );
};

export default MyGoalsCard;

