import { Heart } from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function HomeScreen() {

  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/home-bg.webp')",
      }}
    >
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">

        <div className="text-center mb-8 space-y-3">
          <div className="flex justify-center mb-4">
            <Heart className="w-16 h-16 text-amber-100 fill-amber-100 drop-shadow-xl" />
          </div>

          <h1 className="text-7xl font-extrabold text-white tracking-tight drop-shadow-2xl">
            Mangni
          </h1>

           {/* Tagline with background */}
          <div className="inline-block px-6 py-2 rounded-full bg-amber-100/20 backdrop-blur-sm border border-amber-200/30 mx-auto">
            <p className="text-amber-100 text-xl font-semibold drop-shadow-md">
              Find Your Perfect Match
            </p>
          </div>
        </div>

        {/* Imam Ali (AS) Quote */}
        <div className="text-center mb-8 max-w-md px-4">
          <p className="text-amber-100 text-lg italic drop-shadow-xl leading-relaxed">
            "The best companion is one who leads you to righteousness."
          </p>
          <p className="text-amber-200 text-sm mt-3 drop-shadow-xl">
            ~ Imam Ali (a.s)
          </p>
        </div>

        <div className="w-full max-w-md space-y-3">

          <button
            onClick={() => navigate('/add-profile')}
            className="w-full bg-amber-100 text-amber-900 py-4 px-6 rounded-xl font-semibold shadow-xl"
          >
            Add Profile
          </button>

          <button
            onClick={() => navigate('/edit-profile')}
            className="w-full bg-white text-gray-900 py-4 px-6 rounded-xl font-semibold shadow-xl"
          >
            View / Edit My Profile
          </button>

          <button
            onClick={() => navigate('/explore')}
            className="w-full bg-white text-amber-900 py-4 px-6 rounded-xl font-semibold shadow-xl"
          >
            Explore Profiles
          </button>

        </div>
      </div>
    </div>
  );
}