import React from 'react';

export interface Project {
  id: string;
  name: string;
  taskCount: number;
  teammateCount: number;
}

interface ProjectItemProps {
  project: Project;
  onClick?: (projectId: string) => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project, onClick }) => {
  return (
    <button
      onClick={() => onClick?.(project.id)}
      className="w-full text-left py-3 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <h4 className="text-base font-semibold text-gray-900 mb-1">{project.name}</h4>
      <p className="text-sm text-gray-500">
        {project.taskCount} {project.taskCount === 1 ? 'task' : 'tasks'} {project.teammateCount} teammates
      </p>
    </button>
  );
};

export default ProjectItem;

