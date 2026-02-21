import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import ExploreGenderSelect from './ExploreGenderSelect';
import ExploreBoyslist from './ExploreBoyslist';
import ExploreGirlsList from './ExploreGirlsList';
import ExploreProfileDetail from './ExploreProfileDetail';
import { useNavigate } from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";
import { setExploreHandling } from '../backButtonState';
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

export default function Explore() {
  const navigate = useNavigate();

  const [view, setView] = useState<'select' | 'boys' | 'girls' | 'detail'>('select');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [previousView, setPreviousView] = useState<'boys' | 'girls' | null>(null);
  
  const [boysScrollPosition, setBoysScrollPosition] = useState(0);
  const [girlsScrollPosition, setGirlsScrollPosition] = useState(0);
  
  const [boysSearchQuery, setBoysSearchQuery] = useState('');
  const [girlsSearchQuery, setGirlsSearchQuery] = useState('');

  useEffect(() => {
    setExploreHandling(true);
    
    return () => {
      setExploreHandling(false);
    };
  }, []);

  useEffect(() => {
    const handler = CapacitorApp.addListener("backButton", () => {
      if (view === 'detail') {
        setSelectedProfile(null);
        setView(previousView || 'select');
      } else if (view === 'boys' || view === 'girls') {
        setView('select');
      } else {
        navigate('/');
      }
    });

    return () => {
      handler.then(h => h.remove());
    };
  }, [view, previousView, navigate]);

  const handleViewProfile = (profile: Profile) => {
    setPreviousView(view === 'boys' ? 'boys' : 'girls');
    setSelectedProfile(profile);
    setView('detail');
  };

  const handleBack = () => {
    if (view === 'boys' || view === 'girls') {
      setView('select');
    } else {
      navigate('/');
    }
  };

  return (
  <div className="explore-container">
    {view === 'select' && (
      <>
        <div className="explore-header">
          <button onClick={() => navigate('/')} className="explore-back-btn">
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

    {/* 👇 CHANGE: Keep girls list mounted, just hide it */}
    <div style={{ display: view === 'girls' ? 'block' : 'none' }}>
      <ExploreGirlsList
        onBack={handleBack}
        onSelectProfile={handleViewProfile}
        onOpenAdmin={() => navigate('/admin-dashboard')}
        scrollPosition={girlsScrollPosition}
        onSaveScrollPosition={setGirlsScrollPosition}
        searchQuery={girlsSearchQuery}
        onSearchChange={setGirlsSearchQuery}
      />
    </div>

    {/* 👇 CHANGE: Keep boys list mounted, just hide it */}
    <div style={{ display: view === 'boys' ? 'block' : 'none' }}>
      <ExploreBoyslist
        onBack={handleBack}
        onSelectProfile={handleViewProfile}
        onOpenAdmin={() => navigate('/admin-dashboard')}
        scrollPosition={boysScrollPosition}
        onSaveScrollPosition={setBoysScrollPosition}
        searchQuery={boysSearchQuery}
        onSearchChange={setBoysSearchQuery}
      />
    </div>

    {view === 'detail' && selectedProfile && (
      <ExploreProfileDetail
        profile={selectedProfile}
        onBack={() => {
          setSelectedProfile(null);
          setView(previousView || 'select');
        }}
      />
    )}
  </div>
);
}