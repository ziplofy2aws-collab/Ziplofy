import React from 'react';
import allAboutcodiicImg from '../assets/all-about-codiic.png';

interface OverviewVideoCardProps {
  videoUrl?: string;
  title?: string;
  onPlay?: () => void;
}

const OverviewVideoCard: React.FC<OverviewVideoCardProps> = ({
  videoUrl,
}) => {
  return (
    <div className="flex-1 rounded-xl border border-admin-border bg-admin-surface p-5">
      <div className="mb-4">
        <h3 className="text-[13px] font-semibold text-admin-text">Watch a quick overview video</h3>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-admin-secondary">
        {videoUrl ? (
          <iframe
            src={videoUrl}
            className="h-full w-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Overview Video"
          />
        ) : (
          <img
            src={allAboutcodiicImg}
            alt="All About codiic"
            className="h-full w-full object-cover"
          />
        )}
      </div>
    </div>
  );
};

export default OverviewVideoCard;
