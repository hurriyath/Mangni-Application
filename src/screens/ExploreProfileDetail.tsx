import { ChevronLeft, CheckCircle2, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import girlDisplay from "../assets/girl-display.png";


interface Profile {
  id: string;
  full_name: string;
  gender: string;
  age: number;
  father_name: string;
  paternal_grandfather: string;
  maternal_grandfather: string;
  education: string;
  university_name: string;
  school_name: string;
  occupation: string;
  current_residence: string;
  description: string;
  contact_person: string;
  contact_number: string;
  profile_pic: string;
  created_at: string;
}

interface Props {
  profile: Profile;
  onBack: () => void;
}

export default function ExploreProfileDetail({ profile, onBack }: Props) {
 
const isGirl = profile.gender === "female";

useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  const createdDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="container">
      {/* HEADER */}
      <div className="explore-detail-header">
        <button onClick={onBack} className="explore-detail-back">
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      {/* HERO IMAGE */}
      <div className="details-hero">

        <img src={isGirl ? girlDisplay : profile.profile_pic}
         alt={profile.full_name}
          className="details-hero-img"
          
           />


      </div>

      {/* NAME + VERIFIED */}
      <div className="details-main-card">

  <div className="details-main-header">
    <h1>{profile.full_name}</h1>

    <span className="verified-badge">
      <CheckCircle2 className="w-4 h-4" /> Verified
    </span>
  </div>

  <div className="details-main-grid">
    <div className="details-main-field">
      <span className="field-label">Age</span>
      <span className="field-value">{profile.age} years</span>
    </div>

    <div className="details-main-field">
      <span className="field-label">Occupation</span>
      <span className="field-value">{profile.occupation || '--'}</span>
    </div>
  </div>

</div>

      {/* FAMILY */}
      <div className="details-card">
        <h3>Family</h3>
        <Info label="Father Name" value={profile.father_name} />
        <Info label="Paternal Grandfather" value={profile.paternal_grandfather} />
        <Info label="Maternal Grandfather" value={profile.maternal_grandfather} />
      </div>

      {/* EDUCATION + RESIDENCE */}
      <div className="details-card">
        <h3>Education and Residence</h3>
        <Info label="Education" value={profile.education} />
        <Info label="University" value={profile.university_name} />
        <Info label="School" value={profile.school_name} />
        <Info label="Residence" value={profile.current_residence} />
      </div>

      {/* CONTACT */}
      <div className="details-card">
        <h3>Contact Information</h3>
        <Info label="Contact Person" value={profile.contact_person} />
        <Info label="Contact Number" value={profile.contact_number} />
      </div>

      {/* ABOUT → only if exists */}
      {profile.description && profile.description.trim() !== "" && (
        <div className="details-card">
          <h3>About</h3>
          <p className="details-about">{profile.description}</p>
        </div>
      )}

      {/* CREATED DATE */}
      <p className="details-created">Profile created on {createdDate}</p>
    </div>
  );
}

/* 🔹 Info Row Component */
function Info({ label, value }: { label: string; value?: string | number }) {
  if (!value || value === "") value = "--";

  return (
    <div className="info-col">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
}
