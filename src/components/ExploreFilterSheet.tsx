import { X } from 'lucide-react';

interface Filters {
  ageMin: number;
  ageMax: number;
  education: string;
  occupation: string;
}

interface Props {
  onClose: () => void;
  filters: Filters;
  onApply: (filters: Filters) => void;
}

export default function ExploreFilterSheet({ onClose, filters, onApply }: Props) {
  const handleChange = (key: keyof Filters, value: any) => {
    onApply({ ...filters, [key]: value });
  };

  return (
    <>
      <div className="explore-filter-overlay" onClick={onClose}></div>
      <div className="explore-filter-sheet">
        <div className="explore-filter-header">
          <h2>Filters</h2>
          <button onClick={onClose} className="explore-filter-close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="explore-filter-content">
          <div className="explore-filter-group">
            <label className="explore-filter-label">Age Range</label>
            <div className="explore-filter-range">
              <div className="explore-filter-input-wrapper">
                <label>Min</label>
                <input
                  type="number"
                  min="18"
                  max="60"
                  value={filters.ageMin}
                  onChange={e => handleChange('ageMin', parseInt(e.target.value))}
                  className="explore-filter-input"
                />
              </div>
              <div className="explore-filter-input-wrapper">
                <label>Max</label>
                <input
                  type="number"
                  min="18"
                  max="60"
                  value={filters.ageMax}
                  onChange={e => handleChange('ageMax', parseInt(e.target.value))}
                  className="explore-filter-input"
                />
              </div>
            </div>
          </div>

          <div className="explore-filter-group">
            <label className="explore-filter-label">Education</label>
            <input
              type="text"
              placeholder="e.g., Bachelor, Masters..."
              value={filters.education}
              onChange={e => handleChange('education', e.target.value)}
              className="explore-filter-text-input"
            />
          </div>

          <div className="explore-filter-group">
            <label className="explore-filter-label">Occupation</label>
            <input
              type="text"
              placeholder="e.g., Engineer, Doctor..."
              value={filters.occupation}
              onChange={e => handleChange('occupation', e.target.value)}
              className="explore-filter-text-input"
            />
          </div>

          <button onClick={onClose} className="explore-filter-apply">
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
