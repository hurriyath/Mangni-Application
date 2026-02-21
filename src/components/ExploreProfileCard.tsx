import { CheckCircle2, User } from 'lucide-react';
import girlDefault from '../assets/girl-default.png';


interface Profile {
  id: string;
  full_name: string;
  age: number;
  father_name: string;
  education: string;
  occupation: string;
  profile_pic: string;
}

interface Props {
  profile: Profile;
  onClick: () => void;
  gender: 'male' | 'female';
}
 export default function ExploreProfileCard({ profile, onClick, gender }: Props) {
  const isGirl = gender === 'female';

  const imgSrc = isGirl
  ? girlDefault : profile.profile_pic;


  return (

    <div className="explore-card" onClick={onClick}>
  <img
  src={imgSrc}
  alt={profile.full_name}
  loading="lazy"
  decoding="async"
  className="card-img"
/>



  <div className="card-info">
    <div className="card-name-row">
      <h3 className="card-name">{profile.full_name}</h3>
      <CheckCircle2 className="verified-icon" />
    </div>

    {profile.father_name && (
      <div className="card-father">{profile.father_name}</div>
    )}

    {profile.education && (
      <div className="card-education">{profile.education}</div>
    )}

    <div className="card-meta">
      <span>{profile.age} yrs</span>
      {gender === "male" && profile.occupation && (
        <span>{profile.occupation}</span>
      )}
    </div>
  </div>
</div>

  );
}
