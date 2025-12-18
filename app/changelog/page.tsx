'use client';

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Changelog</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                v1.2.0
              </span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">December 17, 2025</p>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Latest Updates</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Added personalized dashboard with real user names</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Implemented "Continue where you left off" feature</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Added study feedback with Helpful/Not Helpful buttons</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Introduced daily study streak tracking</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Enhanced AI response quality with tone selection</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Added recently viewed lessons section</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                v1.1.0
              </span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">November 2025</p>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Previous Release</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Launched interactive quiz system</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Added lesson viewing and tracking</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Improved dashboard layout and navigation</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                v1.0.0
              </span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">October 2025</p>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Initial Release</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Core study platform launched</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>User authentication and profiles</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Basic lesson management</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <a href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
