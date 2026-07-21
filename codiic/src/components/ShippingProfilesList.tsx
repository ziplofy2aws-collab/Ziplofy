import React from 'react';
import { useNavigate } from 'react-router-dom';
import ShippingProfileCard from './ShippingProfileCard';
import { ShippingProfile } from '../contexts/shipping-profile.context';

interface ShippingProfilesListProps {
  profiles: ShippingProfile[];
}

const ShippingProfilesList: React.FC<ShippingProfilesListProps> = ({ profiles }) => {
  const navigate = useNavigate();

  if (profiles.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      {profiles.map((profile) => (
        <ShippingProfileCard
          key={profile._id}
          profileId={profile._id}
          profileName={profile.profileName}
          onClick={() => navigate(`/settings/shipping-and-delivery/profiles/${profile._id}`)}
        />
      ))}
    </div>
  );
};

export default ShippingProfilesList;

