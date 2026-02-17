import Navigation from './Navigation';

export default function About({ onNavigate }) {
  return (
    <div>
      <Navigation currentPage="about" onNavigate={onNavigate} />

      <main className='about-container'>
        {/* About Section */}
        <div className="about-intro">
          <h1 className="about-title">
            About AquaGuard: Ensuring Water Quality
          </h1>
          <p className="about-text">
            AquaGuard is dedicated to safeguarding one of Earth's most precious resources. We
            provide innovative, accurate, and accessible water quality monitoring solutions,
            empowering individuals and organizations to make informed decisions for healthier
            water systems.
          </p>
        </div>

        {/* Services Section */}
        <div>
          <h2 className="section-title">
            Our Comprehensive Services
          </h2>
          <div className="services-grid">
            {/* Service 1 */}
            <div className="service-card">
              <div className="service-icon">📊</div>
              <h3 className="service-title">
                Detailed Data Visualization & Reporting
              </h3>
              <p className="service-description">
                Access easy-to-understand reports and visualizations of your water quality data
                over time, helping you track trends and measure the effectiveness of management
                strategies.
              </p>
            </div>

            {/* Service 2 */}
            <div className="service-card">
              <div className="service-icon">💡</div>
              <h3 className="service-title">
                Actionable Recommendations
              </h3>
              <p className="service-description">
                Receive personalized advice and practical recommendations for improving and
                maintaining optimal water quality based on your specific test results and
                environmental factors.
              </p>
            </div>

            {/* Service 3 */}
            <div className="service-card">
              <div className="service-icon">🤝</div>
              <h3 className="service-title">
                Dedicated Client Support
              </h3>
              <p className="service-description">
                Our team is committed to providing ongoing support and guidance, ensuring you
                have the resources and knowledge to manage your water quality effectively.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div style={{ backgroundColor: '#f0f4f8', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', padding: '32px', border: '1px solid #e0e6ed' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginBottom: '16px' }}>Our Mission</h2>
          <p style={{ fontSize: '16px', color: '#666666', lineHeight: 1.8 }}>
            To empower communities and organizations worldwide with the knowledge and tools
            necessary to protect water resources and maintain safe, healthy aquatic environments
            for current and future generations.
          </p>
        </div>
      </main>

      <footer className="footer">
        <div>
          © 2026 AquaGuard. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
