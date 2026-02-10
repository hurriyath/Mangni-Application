import { Users } from 'lucide-react';

interface Props {
  onViewBoys: () => void;
  onViewGirls: () => void;
}

export default function ExploreGenderSelect({ onViewBoys, onViewGirls }: Props) {
  return (
    <div className="explore-gender-select">
      <div className="explore-gender-content">
        <p className="explore-gender-subtitle">Who would you like to explore?</p>

        <div className="explore-gender-cards">
          <button className="explore-gender-card boys-card" onClick={onViewBoys}>
            <div className="explore-gender-icon">
              <Users className="w-12 h-12" />
            </div>
            <h2 className="explore-gender-label">View Boys</h2>
            <p className="explore-gender-desc">Find your perfect match</p>
          </button>

          <button className="explore-gender-card girls-card" onClick={onViewGirls}>
            <div className="explore-gender-icon">
              <Users className="w-12 h-12" />
            </div>
            <h2 className="explore-gender-label">View Girls</h2>
            <p className="explore-gender-desc">Find your perfect match</p>
          </button>
        </div>
      </div>
    </div>
  );
}
