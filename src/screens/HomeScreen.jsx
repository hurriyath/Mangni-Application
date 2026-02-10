import { Heart } from 'lucide-react';

export default function HomeScreen({ onNavigate }) {

  useEffect(() => {
  fetchBoysSilently();
  fetchGirlsSilently();
}, []);

  return (
    
    <div
      className="min-h-screen flex flex-col relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/home-bg.png')",

      }}
    >
      <div className="absolute inset-0 pointer-events-none ..."></div>


      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
       <div className="text-center mb-8 space-y-3">
  <div className="flex justify-center mb-4">
    <Heart className="w-16 h-16 text-amber-100 fill-amber-100 drop-shadow-xl" />
  </div>

  <h1 className="text-7xl font-extrabold text-white tracking-tight drop-shadow-2xl">
    Mangni
  </h1>

  <p className="text-2xl font-semibold text-amber-100 drop-shadow-xl">
    Find Your Perfect Match
  </p>
</div>

<div className="w-full max-w-md mb-12 text-center">
  <p className="text-2xl leading-relaxed mb-2 italic font-semibold drop-shadow-2xl text-white">
    “Look at one’s character, not appearance.”
  </p>

  <p className="text-lg font-semibold drop-shadow-2xl text-white/95 tracking-wide">
    — Imam Ali (a.s.)
  </p>
</div>
        
        <div className="w-full max-w-md space-y-3">
          <button
            onClick={() => onNavigate('add-profile')}
            className="w-full bg-amber-100 hover:bg-amber-50 text-amber-900 py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 shadow-xl hover:shadow-2xl"
          >
            Add Profile
          </button>

          <button
            onClick={() => onNavigate('edit-profile')}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 shadow-xl hover:shadow-2xl"
          >
            View / Edit My Profile
          </button>

          <button
            onClick={() => onNavigate('find-matches')}
            className="w-full bg-white hover:bg-gray-50 text-amber-900 py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 shadow-xl hover:shadow-2xl"
          >
            Explore Profiles
          </button>
        </div>
      </div>
    </div>
  );
}
