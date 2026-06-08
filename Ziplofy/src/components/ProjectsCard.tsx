import { PlusIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import ProjectItem, { Project } from './ProjectItem';

interface ProjectsCardProps {
  projects?: Project[];
  onCreateProject?: () => void;
  onProjectClick?: (projectId: string) => void;
}

const ProjectsCard: React.FC<ProjectsCardProps> = ({
  projects = [
    {
      id: '1',
      name: 'Team brainstorm',
      taskCount: 2,
      teammateCount: 32,
    },
    {
      id: '2',
      name: 'Product launch',
      taskCount: 6,
      teammateCount: 12,
    },
    {
      id: '3',
      name: 'Branding launch',
      taskCount: 4,
      teammateCount: 9,
    },
  ],
  onCreateProject,
  onProjectClick,
}) => {
  const handleCreateProject = useCallback(() => {
    if (onCreateProject) {
      onCreateProject();
    } else {
      console.log('Create new project clicked');
    }
  }, [onCreateProject]);

  const handleProjectClick = useCallback(
    (projectId: string) => {
      if (onProjectClick) {
        onProjectClick(projectId);
      } else {
        console.log('Project clicked:', projectId);
      }
    },
    [onProjectClick]
  );

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects</h3>
        
        {/* Create New Project Button */}
        <button
          onClick={handleCreateProject}
          className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create new project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <ProjectItem key={project.id} project={project} onClick={handleProjectClick} />
        ))}
      </div>
    </div>
  );
};

export default ProjectsCard;

