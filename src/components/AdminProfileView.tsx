import { ChevronLeft, Edit2, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import girlDisplay from "../assets/girl-display.png";

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
  created_at: string;
}

interface AdminProfileViewProps {
  profile: Profile;
  onBack: () => void;
  onEdit: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

export default function AdminProfileView({
  profile,
  onBack,
  onEdit,
  onApprove,
  onReject,
  onDelete,
  isLoading = false,
}: AdminProfileViewProps) {
  const getStatusColor = (status: string) => {
    if (status === 'approved') return 'bg-green-50 border-green-200 text-green-700';
    if (status === 'rejected') return 'bg-red-50 border-red-200 text-red-700';
    return 'bg-yellow-50 border-yellow-200 text-yellow-700';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'approved') return '✓';
    if (status === 'rejected') return '✕';
    return '⏳';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
        </div>
        <div className={`px-3 py-1 rounded-full border text-sm font-semibold flex items-center gap-1 ${getStatusColor(profile.status)}`}>
          <span>{getStatusIcon(profile.status)}</span>
          {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-48">
              {profile.profile_pic ? (
                <img
  src={
    profile.gender === "female"
      ? girlDisplay
      : profile.profile_pic || girlDisplay
  }
  alt={profile.full_name}
  className="w-full h-64 object-cover rounded-lg"
/>

              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No Photo</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {profile.gender}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {profile.age} years
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Height</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {profile.height || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Residence</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {profile.current_residence}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Family</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Father Name</p>
                <p className="font-medium text-gray-900">
                  {profile.father_name || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Paternal Grandfather</p>
                <p className="font-medium text-gray-900">
                  {profile.paternal_grandfather || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Maternal Grandfather</p>
                <p className="font-medium text-gray-900">
                  {profile.maternal_grandfather || '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Education & Occupation
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Education</p>
                <p className="font-medium text-gray-900">
                  {profile.education || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">University</p>
                <p className="font-medium text-gray-900">
                  {profile.university_name || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">School</p>
                <p className="font-medium text-gray-900">
                  {profile.school_name || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Occupation</p>
                <p className="font-medium text-gray-900">
                  {profile.occupation || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Contact Person</p>
              <p className="font-medium text-gray-900">
                {profile.contact_person || '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact Number</p>
              <p className="font-medium text-gray-900">
                {profile.contact_number || '—'}
              </p>
            </div>
          </div>
        </div>

        {profile.description && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              About Themselves
            </h3>
            <p className="text-gray-700 leading-relaxed">{profile.description}</p>
          </div>
        )}

        {profile.status === 'rejected' && profile.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Rejection Reason
            </h3>
            <p className="text-red-800">{profile.rejection_reason}</p>
            <p className="text-sm text-red-700 mt-2">
              Rejected on {new Date(profile.rejected_at).toLocaleDateString()}
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Created</p>
              <p className="font-medium text-gray-900">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Profile ID</p>
              <p className="font-mono text-gray-900 text-xs truncate">
                {profile.id}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onEdit}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>

          {profile.status !== 'approved' && (
            <button
              onClick={onApprove}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
          )}

          {profile.status !== 'rejected' && (
            <button
              onClick={onReject}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          )}

          <button
            onClick={onDelete}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
