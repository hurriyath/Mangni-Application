import { useState, useEffect } from 'react';
import girlDisplay from "../assets/girl-display.png";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Toast, { ToastType } from '../components/Toast';
import ConfirmationDialog from '../components/ConfirmationDialog';
import RejectReasonModal from '../components/RejectReasonModal';
import AdminEditProfile from '../components/AdminEditProfile';
import AdminProfileView from '../components/AdminProfileView';
import '../styles/admin.css';


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
  contact_person: string;
  contact_number: string;
  current_residence: string;
  profile_pic: string;
  status: string;
  rejection_reason: string;
  rejected_at: string;
  is_deleted: boolean;
  created_at: string;
  approved: boolean;
}

interface Stats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  male: number;
  female: number;
}

interface Toast {
  message: string;
  type: ToastType;
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    male: 0,
    female: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
const [savedScrollY, setSavedScrollY] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'view' | 'edit'>('list');

  const [toast, setToast] = useState<Toast | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    action: 'delete' | null;
    profileId: string;
  } | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
    setCurrentPage(1);
  }, [searchQuery, genderFilter, statusFilter, sortBy, profiles]);
  // Restore scroll position when returning to list
useEffect(() => {
  if (viewMode === 'list' && savedScrollY > 0) {
    setTimeout(() => {
      window.scrollTo({ top: savedScrollY, behavior: 'auto' });
    }, 100);
  }
}, [viewMode]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const profilesData = (data as Profile[]) || [];
      setProfiles(profilesData);
      calculateStats(profilesData);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      showToast('Failed to fetch profiles', 'error');
    } finally {
      setLoading(false);
    }
  };
  // Save scroll position when clicking on a profile
const handleViewProfile = (profile) => {
  setSavedScrollY(window.scrollY);
  setSelectedProfile(profile);
  setViewMode('view');
   window.scrollTo({ top: 0, behavior: 'instant' });
};

  const calculateStats = (profileList: Profile[]) => {
    const stats = {
      total: profileList.length,
      approved: profileList.filter(p => p.status === 'approved').length,
      pending: profileList.filter(p => p.status === 'pending').length,
      rejected: profileList.filter(p => p.status === 'rejected').length,
      male: profileList.filter(p => p.gender === 'male').length,
      female: profileList.filter(p => p.gender === 'female').length,
    };
    setStats(stats);
  };

  const applyFiltersAndSort = () => {
    let filtered = [...profiles];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.full_name.toLowerCase().includes(query) ||
          p.father_name?.toLowerCase().includes(query) ||
          p.current_residence?.toLowerCase().includes(query)
      );
    }

    if (genderFilter !== 'all') {
      filtered = filtered.filter(p => p.gender === genderFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (sortBy === 'newest') {
      filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortBy === 'oldest') {
      filtered.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }

    setFilteredProfiles(filtered);
  };

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'approved', approved: true })
        .eq('id', id);

      if (error) throw error;

      const updatedProfiles = profiles.map(p =>
        p.id === id ? { ...p, status: 'approved', approved: true } : p
      );
      setProfiles(updatedProfiles);
      showToast('Profile approved successfully', 'success');
    } catch (err) {
      console.error('Error approving profile:', err);
      showToast('Failed to approve profile', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      setActionLoading(id);
      const { error } = await supabase
        .from('profiles')
        .update({
          status: 'rejected',
          approved: false,
          rejection_reason: reason,
          rejected_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      const updatedProfiles = profiles.map(p =>
        p.id === id
          ? {
              ...p,
              status: 'rejected',
              approved: false,
              rejection_reason: reason,
              rejected_at: new Date().toISOString(),
            }
          : p
      );
      setProfiles(updatedProfiles);
      setRejectModal(null);
      if (viewMode === 'view') setViewMode('list');
      showToast('Profile rejected', 'success');
    } catch (err) {
      console.error('Error rejecting profile:', err);
      showToast('Failed to reject profile', 'error');
    } finally {
      setActionLoading(null);
    }
  };
  

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(id);
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const updatedProfiles = profiles.filter(p => p.id !== id);
      setProfiles(updatedProfiles);
      calculateStats(updatedProfiles);
      setConfirmDialog(null);
      if (viewMode === 'view') setViewMode('list');
      showToast('Profile deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting profile:', err);
      showToast('Failed to delete profile', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditSave = async (updatedData: Partial<Profile>) => {
    if (!selectedProfile) return;

    try {
      setActionLoading(selectedProfile.id);
      const { error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', selectedProfile.id);

      if (error) throw error;

      const updatedProfiles = profiles.map(p =>
        p.id === selectedProfile.id ? { ...p, ...updatedData } : p
      );
      setProfiles(updatedProfiles);
      setSelectedProfile({ ...selectedProfile, ...updatedData });
      setViewMode('view');
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      console.error('Error updating profile:', err);
      showToast('Failed to update profile', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (viewMode === 'view' && selectedProfile) {
    return (
      <AdminProfileView
        profile={selectedProfile}
        onBack={() => {
          setViewMode('list');
          setSelectedProfile(null);
        }}
        onEdit={() => setViewMode('edit')}
        onApprove={() => handleApprove(selectedProfile.id)}
        onReject={() => setRejectModal(selectedProfile.id)}
        onDelete={() =>
          setConfirmDialog({
            title: 'Delete Profile',
            message:
              'Are you sure you want to delete this profile? This action cannot be undone.',
            action: 'delete',
            profileId: selectedProfile.id,
          })
        }
        isLoading={actionLoading === selectedProfile.id}
      />
    );
  }

  if (viewMode === 'edit' && selectedProfile) {
    return (
      <>
        <AdminEditProfile
          profile={selectedProfile}
          onSave={handleEditSave}
          onCancel={() => setViewMode('view')}
          isLoading={actionLoading === selectedProfile.id}
        />
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="admin-back-btn"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1>Admin Dashboard</h1>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Loading profiles...</div>
      ) : (
        <>
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-label">Total Profiles</div>
              <div className="stat-value">{stats.total}</div>
            </div>
            <div className="stat-card stat-approved">
              <div className="stat-label">Approved</div>
              <div className="stat-value">{stats.approved}</div>
            </div>
            <div className="stat-card stat-pending">
              <div className="stat-label">Pending</div>
              <div className="stat-value">{stats.pending}</div>
            </div>
            <div className="stat-card stat-rejected">
              <div className="stat-label">Rejected</div>
              <div className="stat-value">{stats.rejected}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Male / Female</div>
              <div className="stat-value">
                {stats.male} / {stats.female}
              </div>
            </div>
          </div>

          <div className="admin-search-filter">
            <div className="search-input-wrapper">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, father's name, or residence..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            

            <div className="filter-controls">
              <div className="filter-group">
                <Filter className="w-4 h-4" />
                <select
                  value={genderFilter}
                  onChange={e => setGenderFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="filter-group">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="filter-group">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          <div className="admin-content">
            {filteredProfiles.length === 0 ? (
              <div className="empty-state">
                <p>No profiles found</p>
              </div>
            ) : (
              <>
                <div className="admin-cards-container">
  {filteredProfiles
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    .map(profile => (
      <div key={profile.id} className="admin-card">
        <div className="card-header">
          <div className="card-photo">
            {profile.profile_pic ? (
              <img
                src={profile.gender === "female" ? girlDisplay : profile.profile_pic}
                alt={profile.full_name}
                className="card-avatar"
              />
            ) : (
              <div className="card-avatar-placeholder">📷</div>
            )}
          </div>
          <div className="card-info">
            <h3 className="card-name">{profile.full_name}</h3>
            <div className={`card-status ${profile.status}`}>
              {profile.status === 'approved' && '✅ Approved'}
              {profile.status === 'pending' && '⏳ Pending'}
              {profile.status === 'rejected' && '❌ Rejected'}
            </div>
          </div>
        </div>

        <div className="card-details">
          <div className="detail-item">
            <span className="detail-value">{profile.age || '?'} yrs</span>
          </div>
          <div className="detail-item">
            <span className="detail-value">{profile.father_name || '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-value">{profile.paternal_grandfather || '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-value">{profile.maternal_grandfather || '—'}</span>
          </div>
        </div>

        <div className="card-actions">
          <button
            onClick={() => handleViewProfile(profile)}
            className="card-btn view"
          >
            👁️ View
          </button>
          {profile.status !== 'approved' && (
            <button
              onClick={() => handleApprove(profile.id)}
              className="card-btn approve"
            >
              ✅ Approve
            </button>
          )}
          {profile.status !== 'rejected' && (
            <button
              onClick={() => setRejectModal(profile.id)}
              className="card-btn reject"
            >
              ❌ Reject
            </button>
          )}
          <button
  onClick={() =>
    setConfirmDialog({
      title: 'Delete Profile',
      message: 'Are you sure you want to delete this profile?',
      action: 'delete',
      profileId: profile.id,
    })
  }
  className="card-btn delete"
>
  🗑️ Delete
</button>
          
        </div>
      </div>
    ))}
</div>

                <div className="pagination">
                  <div className="pagination-info">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredProfiles.length)} of{' '}
                    {filteredProfiles.length} profiles
                  </div>
                  <div className="pagination-controls">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      Previous
                    </button>
                    <div className="pagination-pages">
                      {Array.from(
                        { length: Math.ceil(filteredProfiles.length / itemsPerPage) },
                        (_, i) => i + 1
                      ).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`pagination-page ${
                            currentPage === page ? 'active' : ''
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        setCurrentPage(
                          Math.min(
                            Math.ceil(filteredProfiles.length / itemsPerPage),
                            currentPage + 1
                          )
                        )
                      }
                      disabled={
                        currentPage >=
                        Math.ceil(filteredProfiles.length / itemsPerPage)
                      }
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {confirmDialog && (
        <ConfirmationDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText="Delete"
          isDangerous={true}
          onConfirm={() => handleDelete(confirmDialog.profileId)}
          onCancel={() => setConfirmDialog(null)}
          isLoading={actionLoading === confirmDialog.profileId}
        />
      )}

      {rejectModal && (
        <RejectReasonModal
          onSubmit={reason => handleReject(rejectModal, reason)}
          onCancel={() => setRejectModal(null)}
          isLoading={actionLoading === rejectModal}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
