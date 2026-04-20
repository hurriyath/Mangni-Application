import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ExploreProfileCard from '../components/ExploreProfileCard';

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
}

let savedGirlsScroll = 0;
let savedGirlsSearch = '';

export default function ExploreGirlsList({ onBack, onSelectProfile, onOpenAdmin }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState(savedGirlsSearch);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [searchTotalCount, setSearchTotalCount] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // Restore scroll
  useEffect(() => {
    if (savedGirlsScroll > 0 && containerRef.current) {
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = savedGirlsScroll;
        }
      }, 100);
    }
  }, []);

  // Save scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      savedGirlsScroll = container.scrollTop;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    return () => {
      setSearchQuery('');
      savedGirlsSearch = '';
    };
  }, []);

  // Initial load
  useEffect(() => {
    loadProfiles(1);
  }, []);

  // Load profiles with pagination
  const loadProfiles = async (pageNum: number) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
        setIsSearching(false);
      } else {
        setLoadingMore(true);
      }

      const from = (pageNum - 1) * 10;
      const to = pageNum * 10 - 1;

      console.log(`📡 Loading girls page ${pageNum} (items ${from}-${to})`);

      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('gender', 'female')
        .eq('status', 'approved')
        .eq('is_deleted', false)
        .range(from, to);

      if (error) throw error;

      // Shuffle for random order
      const shuffledData = data ? [...data].sort(() => Math.random() - 0.5) : [];

      console.log(`✅ Loaded ${shuffledData.length} girls profiles`);

      if (pageNum === 1) {
        setProfiles(shuffledData);
        setFilteredProfiles(shuffledData);
      } else {
        setProfiles(prev => [...prev, ...shuffledData]);
        setFilteredProfiles(prev => [...prev, ...shuffledData]);
      }

      setTotalCount(count || 0);
      setHasMore((count || 0 )> pageNum * 10);
      setPage(pageNum);

    } catch (error) {
      console.error('Error loading girls:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Search function with pagination
  const searchProfiles = async (query: string, pageNum: number = 1, isNewSearch: boolean = true) => {
    try {
      if (isNewSearch) {
        setLoading(true);
        setIsSearching(true);
      } else {
        setLoadingMore(true);
      }
      
      const age = parseInt(query);
      const isAge = !isNaN(age);
      
      const searchConditions: string[] = [];
      
      searchConditions.push(`full_name.ilike.%${query}%`);
      searchConditions.push(`father_name.ilike.%${query}%`);
      searchConditions.push(`education.ilike.%${query}%`);
      searchConditions.push(`occupation.ilike.%${query}%`);
      searchConditions.push(`current_residence.ilike.%${query}%`);
      searchConditions.push(`university_name.ilike.%${query}%`);
      searchConditions.push(`school_name.ilike.%${query}%`);
      
      if (isAge) {
        searchConditions.push(`age.eq.${age}`);
      }
      
      const orString = searchConditions.join(',');
      
      // Pagination: 10 at a time
      const from = (pageNum - 1) * 10;
      const to = pageNum * 10 - 1;
      
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('gender', 'female')
        .eq('status', 'approved')
        .eq('is_deleted', false)
        .or(orString)
        .range(from, to);

      if (error) throw error;
      
      if (isNewSearch) {
        setProfiles(data || []);
        setFilteredProfiles(data || []);
      } else {
        setProfiles(prev => [...prev, ...(data || [])]);
        setFilteredProfiles(prev => [...prev, ...(data || [])]);
      }
      
      setSearchTotalCount(count || 0);
      setSearchHasMore((count  || 0)> pageNum * 10);
      setSearchPage(pageNum);
      
      console.log(`✅ Found ${data?.length} profiles, total ${count}`);
      
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        if (searchQuery === 'OpenPanel33') {
          onOpenAdmin();
          setSearchQuery('');
          return;
        }
        searchProfiles(searchQuery, 1, true);
      } else {
        setIsSearching(false);
        loadProfiles(1);
      }
      savedGirlsSearch = searchQuery;
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Apply filters
  useEffect(() => {
    if (isSearching) return;
    
    
  }, [ profiles, isSearching]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <div className="explore-list-container" ref={containerRef} style={{ height: '100vh', overflowY: 'auto' }}>
      {/* Header */}
      <div className="explore-list-header">
        <button onClick={onBack} className="explore-list-back">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="explore-list-title">Girls Profiles</h1>
      </div>

      {/* Search */}
      <div className="explore-search-box">
        <Search className="explore-search-icon" />
        <input
          type="text"
          placeholder="Search name, education, occupation..."
          value={searchQuery}
          onChange={e => handleSearchChange(e.target.value)}
          className="explore-search-input"
        />
      </div>

      {/* Counter */}
      {!loading && (
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid #eee',
          fontSize: '15px',
          fontWeight: '500',
          color: '#333'
        }}>
          {isSearching ? (
            <>
              Found {profiles.length} of {searchTotalCount} profiles for 
              <span style={{ 
                fontWeight: '600', 
                color: '#d97706',
                margin: '0 4px'
              }}>
                "{searchQuery}"
              </span>
            </>
          ) : (
            <>Total Profiles: {totalCount}</>
          )}
        </div>
      )}

      {/* Content */}
      <div className="explore-list-content">
        {loading ? (
          <div className="explore-profile-list">
            {[1,2,3,4,5,6].map(i => <div key={i} className="card-skeleton" />)}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="explore-empty">
            <p>
              {searchQuery ? (
                <>
                  No profiles found for "{searchQuery}"
                  <br />
                  Try different keywords.
                </>
              ) : (
                'No profiles found'
              )}
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                loadProfiles(1);
              }}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#d97706',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            <div className="explore-profile-list">
              {filteredProfiles.map(profile => (
                <ExploreProfileCard
                  key={profile.id}
                  profile={profile}
                  onClick={() => onSelectProfile(profile)}
                  gender="female"
                />
              ))}
            </div>

            {/* Load More Button for Normal Browsing */}
            {!isSearching && hasMore && (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px',
                margin: '20px 0'
              }}>
                <button
                  onClick={() => loadProfiles(page + 1)}
                  disabled={loadingMore}
                  style={{
                    padding: '12px 30px',
                    backgroundColor: loadingMore ? '#ccc' : '#d97706',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: loadingMore ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loadingMore ? 'Loading...' : 'Load More Profiles'}
                </button>
              </div>
            )}

            {/* Load More Button for Search Results */}
            {isSearching && searchHasMore && (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px',
                margin: '20px 0'
              }}>
                <button
                  onClick={() => searchProfiles(searchQuery, searchPage + 1, false)}
                  disabled={loadingMore}
                  style={{
                    padding: '12px 30px',
                    backgroundColor: loadingMore ? '#ccc' : '#d97706',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: loadingMore ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loadingMore ? 'Loading...' : `Show More (${searchTotalCount - (searchPage * 10)} remaining)`}
                </button>
              </div>
            )}

            {/* End message */}
            {!isSearching && !hasMore && filteredProfiles.length > 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                color: '#999',
                fontSize: '14px'
              }}>
                🎉 You've seen all {totalCount} profiles
              </div>
            )}
          </>
        )}
      </div>

      
    </div>
  );
}