import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TagOptionsItem from './TagOptionsItem';
import { TAG_MANAGEMENT_OPTIONS } from './tagManagementOptions';

const TagOptionsList: React.FC = () => {
  const navigate = useNavigate();

  const handleOptionClick = useCallback(
    (route: string) => {
      navigate(`/tag-management/${route}`);
    },
    [navigate],
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {TAG_MANAGEMENT_OPTIONS.map((option) => (
        <TagOptionsItem key={option.route} option={option} onClick={handleOptionClick} />
      ))}
    </div>
  );
};

export default TagOptionsList;
