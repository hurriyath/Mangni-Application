export default function ComingSoon({ onNavigate }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Coming Soon</h1>

      <p className="text-gray-600 mb-8">
        This feature is under development.
      </p>

      <button
        onClick={() => onNavigate("home")}
        className="bg-amber-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-amber-500"
      >
        Back to Home
      </button>
    </div>
  );
}
