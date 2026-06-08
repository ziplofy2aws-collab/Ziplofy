import React from 'react';
import allAboutZiplofyImg from '../assets/all-about-ziplofy.png';

interface OverviewVideoCardProps {
  videoUrl?: string;
  title?: string;
  onPlay?: () => void;
}

const OverviewVideoCard: React.FC<OverviewVideoCardProps> = ({
  videoUrl,
  title = 'Watch a quick overview video',
  onPlay,
}) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-sm flex-1">
      {/* Header */}
      <div className="mb-4 pl-3 border-l-4 border-blue-600">
        <h3 className="text-base font-semibold text-gray-900">
          Watch a quick overview video
        </h3>
      </div>

      {/* Video/Image Section */}
      <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
        {videoUrl ? (
          <iframe
            src={videoUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Overview Video"
          />
        ) : (
          <img 
            src={allAboutZiplofyImg} 
            alt="All About Ziplofy" 
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
};

export default OverviewVideoCard;

