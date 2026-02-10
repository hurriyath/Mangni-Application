import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import ExploreGenderSelect from './ExploreGenderSelect';
import ExploreBoyslist from './ExploreBoyslist';
import ExploreGirlsList from './ExploreGirlsList';
import ExploreProfileDetail from './ExploreProfileDetail';
import '../styles/explore.css';

interface Profile {
  id: string;
  full_name: string;
  gender: string;
  dob: string;
  age: number;
  father_name: string;
  paternal_grandfather: string;
  maternal_grandfather: string;
  height: string;
  education: string;
  occupation: string;
  university_name: string;
  school_name: string;
  description: string;
  current_residence: string;
  contact_person: string;
  contact_number: string;
  profile_pic: string;
  status: string;
  created_at: string;
}

export default function Explore({
  onNavigate,
}: {
  onNavigate: (screen: string) => void;
}) {
  const [view, setView] = useState<'select' | 'boys' | 'girls' | 'detail'>('select');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const handleViewProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setView('detail');
  };

  const handleBack = () => {
    if (view === 'detail') {
      setSelectedProfile(null);
      setView(selectedProfile?.gender === 'male' ? 'boys' : 'girls');
    } else if (view === 'boys' || view === 'girls') {
      setView('select');
    } else {
      onNavigate('home');
    }
  };

  return (
    <div className="explore-container">
      {view === 'select' && (
        <>
          <div className="explore-header">
            <button onClick={() => onNavigate('home')} className="explore-back-btn">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="explore-title">Explore Profiles</h1>
            <div className="explore-header-spacer"></div>
          </div>
          <ExploreGenderSelect
            onViewBoys={() => setView('boys')}
            onViewGirls={() => setView('girls')}
          />
        </>
      )}

      {view === 'boys' && (
        <ExploreBoyslist onBack={handleBack} onSelectProfile={handleViewProfile} onOpenAdmin={() => onNavigate('admin-dashboard')} />
      )}

      {view === 'girls' && (
        <ExploreGirlsList onBack={handleBack} onSelectProfile={handleViewProfile} onOpenAdmin={() => onNavigate('admin-dashboard')} />
      )}

      {view === 'detail' && selectedProfile && (
        <ExploreProfileDetail
          profile={selectedProfile}
          onBack={() => {
            setSelectedProfile(null);
            setView(selectedProfile.gender === 'male' ? 'boys' : 'girls');
          }}
        />
      )}
    </div>
  );
}
