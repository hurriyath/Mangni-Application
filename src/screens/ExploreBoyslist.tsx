import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ExploreFilterSheet from '../components/ExploreFilterSheet';
import ExploreProfileCard from '../components/ExploreProfileCard';
import { getBoysCache, setBoysCache } from '../profileCache';

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
  onOpenAdmin: () => void;
  scrollPosition?: number;
  onSaveScrollPosition?: (position: number) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function ExploreBoyslist({ 
  onBack, 
  onSelectProfile, 
  onOpenAdmin, 
  scrollPosition, 
  onSaveScrollPosition,
  searchQuery = '',
  onSearchChange
}: Props) {
  const cachedData = getBoysCache();
  const [profiles, setProfiles] = useState<Profile[]>(cachedData);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>(cachedData);
  const [displayedCount, setDisplayedCount] = useState(12);
  const [loading, setLoading] = useState(cachedData.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState({
    ageMin: 18,
    ageMax: 60,
    education: '',
    occupation: '',
  });

  // Sync local search with parent when coming back
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Restore scroll
  useEffect(() => {
    if (scrollPosition !== undefined && scrollPosition > 0) {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPosition);
      });
    }
  }, [scrollPosition]);

  // Save scroll
  useEffect(() => {
    if (!onSaveScrollPosition) return;

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const position = window.scrollY || window.pageYOffset;
        onSaveScrollPosition(position);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [onSaveScrollPosition]);

  useEffect(() => {
    if (cachedData.length === 0) {
      fetchProfiles();
    }
  }, []);

  useEffect(() => {
    profiles.slice(0, 6).forEach(p => {
      const img = new Image();
      img.src = `${p.profile_pic}?width=400&quality=80&format=webp`;
    });
  }, [profiles]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_deleted', false)
        .eq('gender', 'male')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setProfiles(data || []);
      setBoysCache(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search and filter
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      applyFiltersAndSearch();
      setDisplayedCount(12);
      onSearchChange?.(localSearchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [localSearchQuery, filters, profiles]);

  const applyFiltersAndSearch = () => {
    let filtered = [...profiles];

    if (localSearchQuery && localSearchQuery.trim() !== '') {
      const query = localSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.full_name?.toLowerCase().includes(query) ||
        p.father_name?.toLowerCase().includes(query) ||
        p.education?.toLowerCase().includes(query) ||
        p.occupation?.toLowerCase().includes(query) ||
        p.current_residence?.toLowerCase().includes(query) ||
        p.age.toString().includes(query)
      );
    }

    filtered = filtered.filter(
      p => p.age >= filters.ageMin && p.age <= filters.ageMax
    );

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

  // Infinite scroll
  useEffect(() => {
    const loadMore = () => {
      if (displayedCount >= filteredProfiles.length) return;
      
      setLoadingMore(true);
      setTimeout(() => {
        setDisplayedCount(prev => prev + 12);
        setLoadingMore(false);
      }, 300);
    };

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreTriggerRef.current) {
      observerRef.current.observe(loadMoreTriggerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [displayedCount, filteredProfiles.length, loadingMore]);

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);

    if (value.trim() === 'OpenPanel33') {
      setLocalSearchQuery('');
      onSearchChange?.('');
      onOpenAdmin();
    }
  };

  const profilesToShow = filteredProfiles.slice(0, displayedCount);
  const hasMore = displayedCount < filteredProfiles.length;

  return (
    <div className="explore-list-container">
      <div className="explore-list-header">
        <button onClick={onBack} className="explore-list-back">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="explore-list-title">Boys Profiles</h1>
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
          placeholder="Search name, age, education, location..."
          value={localSearchQuery}
          onChange={e => handleSearchChange(e.target.value)}
          className="explore-search-input"
        />
      </div>

      {!loading && filteredProfiles.length > 0 && (
        <div style={{ 
          padding: '12px 16px', 
          fontSize: '15px', 
          fontWeight: '500',
          color: '#333',
          borderBottom: '1px solid #eee'
        }}>
          {localSearchQuery ? (
            <>
              Found {filteredProfiles.length} {filteredProfiles.length === 1 ? 'profile' : 'profiles'} for 
              <span style={{ 
                fontWeight: '600', 
                color: '#d97706',
                margin: '0 4px'
              }}>
                "{localSearchQuery}"
              </span>
            </>
          ) : (
            <>
              {filteredProfiles.length} {filteredProfiles.length === 1 ? 'Profile' : 'Profiles'}
            </>
          )}
        </div>
      )}

      <div className="explore-list-content">
        {loading ? (
          <div className="explore-profile-list">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="card-skeleton" />
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="explore-empty">
            <p>
              {localSearchQuery ? (
                <>
                  No profiles found for 
                  <span style={{ fontWeight: '600', color: '#d97706', margin: '0 4px' }}>
                    "{localSearchQuery}"
                  </span>
                  <br />
                  Try different keywords.
                </>
              ) : (
                'No profiles found. Try adjusting your filters.'
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="explore-profile-list">
              {profilesToShow.map(profile => (
                <ExploreProfileCard
                  key={profile.id}
                  profile={profile}
                  onClick={() => onSelectProfile(profile)}
                  gender="male"
                />
              ))}
            </div>

            {hasMore && (
              <div ref={loadMoreTriggerRef} style={{ height: '20px', margin: '20px 0' }}>
                {loadingMore && (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    Loading more profiles...
                  </div>
                )}
              </div>
            )}

            {!hasMore && filteredProfiles.length > 12 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                color: '#666',
                fontSize: '14px'
              }}>
                You've reached the end • {filteredProfiles.length} profiles shown
              </div>
            )}
          </>
        )}
      </div>

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