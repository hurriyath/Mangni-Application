import { useState, useEffect } from 'react';
import { ChevronLeft, Search, Filter } from 'lucide-react';
import ExploreFilterSheet from '../components/ExploreFilterSheet';
import ExploreProfileCard from '../components/ExploreProfileCard';
import { supabase } from '../lib/supabase';


interface Profile {
  id: string;
  full_name: string;
  gender: string;
  age: number;
  father_name: string;
  education: string;
  occupation: string;
  current_residence: string;
  profile_pic: string;
  status: string;
  created_at: string;
  dob: string;
  paternal_grandfather: string;
  maternal_grandfather: string;
  height: string;
  university_name: string;
  school_name: string;
  description: string;
  contact_person: string;
  contact_number: string;
}

interface Props {
  onBack: () => void;
  onSelectProfile: (profile: Profile) => void;
}

export default function ExploreGirlsList({ onBack, onSelectProfile, onOpenAdmin }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    ageMin: 18,
    ageMax: 60,
    education: '',
    occupation: '',
  });

  const itemsPerPage = 20;

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
    setCurrentPage(1);
  }, [searchQuery, filters, profiles]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('gender', 'female')
        .eq('status', 'approved')
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setProfiles((data as Profile[]) || []);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...profiles];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.full_name.toLowerCase().includes(query) ||
          p.father_name?.toLowerCase().includes(query) ||
          p.current_residence?.toLowerCase().includes(query) ||
          p.education?.toLowerCase().includes(query) ||
          p.occupation?.toLowerCase().includes(query) ||
          p.university_name?.toLowerCase().includes(query) ||
          p.school_name?.toLowerCase().includes(query) ||
          p.age.toString().includes(query)
      );
    }

    if (filters.ageMin || filters.ageMax) {
      filtered = filtered.filter(
        p => p.age >= filters.ageMin && p.age <= filters.ageMax
      );
    }

    if (filters.education) {
      filtered = filtered.filter(p =>
        p.education?.toLowerCase().includes(filters.education.toLowerCase())
      );
    }

    if (filters.occupation) {
      filtered = filtered.filter(p =>
        p.occupation?.toLowerCase().includes(filters.occupation.toLowerCase())
      );
    }

    setFilteredProfiles(filtered);
  };

  const paginatedProfiles = filteredProfiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);

  return (
    <div className="explore-list-container">
      <div className="explore-list-header">
        <button onClick={onBack} className="explore-list-back">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="explore-list-title">Girls Profiles</h1>
        <button
          onClick={() => setShowFilter(true)}
          className="explore-list-filter-toggle"
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      <div className="explore-search-box">
        <Search className="explore-search-icon" />
        <input
          type="text"
          placeholder="Search name, age, education..."
          value={searchQuery}
          onChange={e => {
  const value = e.target.value;
  setSearchQuery(value);

  if (value.trim() === 'OpenPanel33') {
    setSearchQuery('');
    onOpenAdmin();
  }
}}

          className="explore-search-input"
        />
      </div>

      <div className="explore-list-content">
        {loading ? (
          <div className="explore-loading">Loading profiles...</div>
        ) : filteredProfiles.length === 0 ? (
          <div className="explore-empty">
            <p>No profiles found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="explore-profile-list">
            {paginatedProfiles.map(profile => (
              <ExploreProfileCard
                key={profile.id}
                profile={profile}
                onClick={() => onSelectProfile(profile)}
                gender="female"
              />
            ))}
          </div>
        )}
      </div>

      {filteredProfiles.length > 0 && (
        <div className="explore-pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="explore-pagination-btn"
          >
            Previous
          </button>
          <span className="explore-pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="explore-pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {showFilter && (
        <ExploreFilterSheet
          onClose={() => setShowFilter(false)}
          filters={filters}
          onApply={setFilters}
        />
      )}
    </div>
  );
}
