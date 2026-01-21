import Navigation from './Navigation';

export default function About({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="about" onNavigate={onNavigate} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            About AquaGuard: Ensuring Water Quality
          </h1>
          <p className="text-gray-600 leading-relaxed text-lg">
            AquaGuard is dedicated to safeguarding one of Earth's most precious resources. We
            provide innovative, accurate, and accessible water quality monitoring solutions,
            empowering individuals and organizations to make informed decisions for healthier
            water systems.
          </p>
        </div>

        {/* Services Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Comprehensive Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Detailed Data Visualization & Reporting
              </h3>
              <p className="text-gray-600">
                Access easy-to-understand reports and visualizations of your water quality data
                over time, helping you track trends and measure the effectiveness of management
                strategies.
              </p>
            </div>

            {/* Service 2 */}
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
              <div className="text-5xl mb-4">💡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Actionable Recommendations
              </h3>
              <p className="text-gray-600">
                Receive personalized advice and practical recommendations for improving and
                maintaining optimal water quality based on your specific test results and
                environmental factors.
              </p>
            </div>

            {/* Service 3 */}
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Dedicated Client Support
              </h3>
              <p className="text-gray-600">
                Our team is committed to providing ongoing support and guidance, ensuring you
                have the resources and knowledge to manage your water quality effectively.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-blue-50 rounded-lg shadow-sm p-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            To empower communities and organizations worldwide with the knowledge and tools
            necessary to protect water resources and maintain safe, healthy aquatic environments
            for current and future generations.
          </p>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600 text-sm">
          © 2026 AquaGuard. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
