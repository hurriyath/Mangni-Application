import { useState } from 'react';
import { X } from 'lucide-react';

interface RejectReasonModalProps {
  onSubmit: (reason: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PRESET_REASONS = [
  'Incomplete profile',
  'Invalid photos',
  'Incorrect information',
  'Does not meet requirements',
  'Duplicate profile',
  'Inappropriate content',
  'Other',
];

export default function RejectReasonModal({
  onSubmit,
  onCancel,
  isLoading = false,
}: RejectReasonModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleSubmit = () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    if (reason.trim()) {
      onSubmit(reason);
    }
  };

  const isValid =
    selectedReason && (selectedReason !== 'Other' || customReason.trim());

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Reject Profile</h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Please select or enter a reason for rejection:
        </p>

        <div className="space-y-2 mb-4">
          {PRESET_REASONS.map(reason => (
            <label
              key={reason}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="radio"
                name="reason"
                value={reason}
                checked={selectedReason === reason}
                onChange={e => setSelectedReason(e.target.value)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">{reason}</span>
            </label>
          ))}
        </div>

        {selectedReason === 'Other' && (
          <textarea
            value={customReason}
            onChange={e => setCustomReason(e.target.value)}
            placeholder="Enter custom reason..."
            maxLength={500}
            rows={4}
            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}
