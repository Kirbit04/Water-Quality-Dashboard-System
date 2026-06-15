import { useState, useEffect, useRef} from 'react';
import Navigation from './Navigation';
import { labTestAPI } from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Function to download recommendations and scores
const generatePDFReport = async (healthScore, wqiScore, recommendations, testDate, trendChartRef, paramChartRef, kpis, user) => {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    // Title
    doc.setFontSize(20);
    doc.setTextColor(10, 185, 129);
    doc.text('AQUALITCS - WATER QUALITY REPORT', margin, yPosition);
    yPosition += 10;

    //User info (name, phone and email)
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    doc.text('Full Name: ' + (user.name || 'Not provided'), margin, yPosition);
    yPosition += 6;
    doc.text('Email: ' + (user.email || 'Not provided'), margin, yPosition);
    yPosition += 6;
    doc.text('Phone: ' + (user.phone || 'Not provided'), margin, yPosition);
    yPosition += 10;

    // Date
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    const dateStr = new Date(testDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    doc.text(`Generated: ${dateStr}`, margin, yPosition);
    yPosition += 10;

    // Divider line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Score Summary Section
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('SCORE SUMMARY', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Health Score: ${healthScore}%`, margin, yPosition);
    yPosition += 6;
    doc.text(`WQI Score: ${parseFloat(wqiScore).toFixed(1)} / 100`, margin, yPosition);
    yPosition += 10;

    // KPI Table
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    doc.text('KEY PARAMETERS', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    const kpiData = kpis.map(kpi => [
      kpi.label,
      kpi.value !== null && kpi.value !== undefined ? parseFloat(kpi.value).toFixed(2) : '—',
      kpi.unit,
      kpi.status
    ]);

    autoTable(doc,{
      head: [['Parameter', 'Value', 'Unit', 'Status']],
      body: kpiData,
      startY: yPosition,
      margin: margin,
      theme: 'grid',
      styles: { fontSize: 9 },
      headerStyles: { fillColor: [16, 185, 129], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    // Charts Section
    doc.addPage();
    yPosition = 15;

    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('TREND ANALYSIS', margin, yPosition);
    yPosition += 10;

    // Health & WQI Charts
    if (trendChartRef?.current) {
      try {
        const canvas = await html2canvas(trendChartRef.current, { 
          scale: 2,
          useCORS: true 
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;

        if (yPosition + imgHeight > pageHeight - 10) {
          doc.addPage();
          yPosition = 15;
        }

        doc.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      } catch (err) {
        console.error('Error capturing trend chart:', err);
      }
    }

    // Parameters Chart
    if (paramChartRef?.current) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 15;
      }

      try {
        const canvas = await html2canvas(paramChartRef.current, { 
          scale: 2,
          useCORS: true 
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;

        if (yPosition + imgHeight > pageHeight - 10) {
          doc.addPage();
          yPosition = 15;
        }

        doc.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      } catch (err) {
        console.error('Error capturing parameter chart:', err);
      }
    }

    // Recommendations Section
    if (recommendations.length > 0) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 15;
      }

      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text('RECOMMENDATIONS', margin, yPosition);
      yPosition += 8;

      const recommendationData = recommendations.map((rec) => [
        rec.recommendation_type,
        rec.recommendation_text,
        rec.severity_level
      ]);

      autoTable(doc,{
        head: [['Type', 'Recommendation', 'Severity']],
        body: recommendationData,
        startY: yPosition,
        margin: margin,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 },
        headerStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: contentWidth - 80 },
          2: { cellWidth: 30 }
        },
        bodyStyles: { valign: 'top' }
      });

      yPosition = doc.lastAutoTable.finalY + 10;
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    // Download
    const fileName = `AquaGuard_Report_${user?.name || 'User'}_${dateStr.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
};

// WHO thresholds for status badges
const getStatus = (param, value) => {
  if (value === null || value === undefined) return 'Unknown';
  const v = parseFloat(value);
  switch (param) {
    case 'ph':
      return v >= 6.5 && v <= 8.5 ? 'Good' : v >= 6.0 && v <= 9.0 ? 'Moderate' : 'Critical';
    case 'turbidity':
      return v <= 4 ? 'Good' : v <= 10 ? 'Moderate' : 'Critical';
    case 'dissolved_oxygen':
      return v >= 6.5 ? 'Good' : v >= 4 ? 'Moderate' : 'Critical';
    case 'nitrates':
      return v <= 10 ? 'Good' : v <= 50 ? 'Moderate' : 'Critical';
    case 'phosphates':
      return v <= 0.1 ? 'Good' : v <= 0.5 ? 'Moderate' : 'Critical';
    case 'salinity':
      return v <= 0.5 ? 'Good' : v <= 1.5 ? 'Moderate' : 'Critical';
    default:
      return 'Unknown';
  }
};

// mapping API response to KPI cards with status
const buildKPIs = (parameters) => [
  { label: 'pH Level',          key: 'ph',               value: parameters.ph,               unit: 'pH Units', icon: '💧' },
  { label: 'Turbidity',         key: 'turbidity',         value: parameters.turbidity,         unit: 'NTU',      icon: '〰️' },
  { label: 'Salinity',          key: 'salinity',          value: parameters.salinity,          unit: 'PPT',      icon: '❄️' },
  { label: 'Dissolved Oxygen',  key: 'dissolved_oxygen',  value: parameters.dissolved_oxygen,  unit: 'mg/L',     icon: '💨' },
  { label: 'Nitrates',          key: 'nitrates',          value: parameters.nitrates,          unit: 'mg/L',     icon: '📊' },
  { label: 'Phosphates',        key: 'phosphates',        value: parameters.phosphates,        unit: 'mg/L',     icon: '⚗️' },
].map(kpi => ({ ...kpi, status: getStatus(kpi.key, kpi.value) }));

// Health score label based on score thresholds
const getHealthLabel = (score) => {
  if (score >= 90) return 'Excellent water quality';
  if (score >= 70) return 'Good water quality';
  if (score >= 50) return 'Moderate water quality';
  if (score >= 30) return 'Poor water quality';
  return 'Critical water quality';
};

// setting status colors
const StatusBadge = ({ status }) => {
  const statusColors = {
    Good:     'badge-good',
    Moderate: 'badge-moderate',
    Critical: 'badge-critical',
    High:  'badge-critical',
  };
  return (
    <span className={'kpi-badge ' + (statusColors[status] || 'badge-critical')}>
      {status}
    </span>
  );
};

const LoadingSpinner = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
    <div style={{
      width: '48px', height: '48px', border: '4px solid #e0e0e0',
      borderTop: '4px solid #3b82f6', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading your water quality data...</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const ErrorBanner = ({ message }) => (
  <div style={{ margin: '24px', padding: '16px', backgroundColor: '#ffe6e6',
                borderRadius: '8px', color: '#cc0000', textAlign: 'center' }}>
    {message}
  </div>
);

const NoDataBanner = () => (
  <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6b7280' }}>
    <p style={{ fontSize: '18px', marginBottom: '16px' }}>No lab tests found.</p>
    <button className="welcome-button" onClick={() => onNavigate('labtest')}>
      Upload Your First Lab Test
    </button>
  </div>
);

// Trend Chart Components
const HealthAndWQITrendChart = ({ trendData }) => {
  if (!trendData || trendData.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', margin: '24px' }}>
      {/* Health Score Trend */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
          Health Score Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis
              domain={[0, 100]}
              label={{ value: '% Score', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px'
              }}
              formatter={(value) => `${value}%`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="healthScore"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 5 }}
              activeDot={{ r: 7 }}
              isAnimationActive={true}
              name="Health Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* WQI Score Trend */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
          WQI Score Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis
              domain={[0, 100]}
              label={{ value: 'WQI Score (0-100)', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px'
              }}
              formatter={(value) => value.toFixed(1)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="wqiScore"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 5 }}
              activeDot={{ r: 7 }}
              isAnimationActive={true}
              name="WQI Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const ParametersTrendChart = ({ parameterData }) => {
  if (!parameterData || parameterData.length === 0) {
    return null;
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      margin: '24px'
    }}>
      <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
        Water Parameters Trend
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={parameterData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
            label={{ value: 'Parameter Value', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px'
            }}
            formatter={(value) => value?.toFixed(2) || 'N/A'}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="ph"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
            name="pH"
          />
          <Line
            type="monotone"
            dataKey="turbidity"
            stroke="#ec4899"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
            name="Turbidity (NTU)"
          />
          <Line
            type="monotone"
            dataKey="dissolved_oxygen"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
            name="Dissolved Oxygen (mg/L)"
          />
          <Line
            type="monotone"
            dataKey="nitrates"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
            name="Nitrates (mg/L)"
          />
          <Line
            type="monotone"
            dataKey="phosphates"
            stroke="#14b8a6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
            name="Phosphates (mg/L)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const ScoreExplanationBanner = () => (
  <div style={{
    margin: '24px',
    padding: '12px 28px',
    backgroundColor: '#eff6ff',
    borderRadius: '2px',
    color: '#1e40af',
    fontSize: '14px'
  }}>
    Health Score is a percentage rating of your water quality; WQI (Water Quality Index) is a scientific measurement of water fitness based on parameters like pH, oxygen, and other pollutants. More information on the report that can be downloaded below!
  </div>
);

// setting main dashboard page
export default function Dashboard({ user, onNavigate }) {
  const [kpis, setKpis]               = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [riskLevel, setRiskLevel]     = useState(null);
  const [wqiScore, setWqiScore]       = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [testDate, setTestDate]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [hasData, setHasData]         = useState(false);
  const [trendData, setTrendData]     = useState([]);
  const [parameterData, setParameterData] = useState([]);
  const trendChartRef = useRef(null);
  const paramChartRef = useRef(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1 — fetch all tests for this user
        const tests = await labTestAPI.getUserTests(user.id, 0, 100);

        if (!tests || tests.length === 0) {
          setHasData(false);
          return;
        }

        // Sort tests by date (oldest first for trending)
        const sortedTests = [...tests].sort((a, b) =>
          new Date(a.created_at) - new Date(b.created_at)
        );

        // Step 2 — fetch results for each test and build trend data
        const trendPoints = [];
        const paramPoints = [];

        for (const test of sortedTests) {
          try {
            const results = await labTestAPI.getResults(test.id);
            
            if (results && results.health_score !== undefined && results.wqi_score !== undefined) {
              const dateStr = new Date(test.created_at).toLocaleString('en-KE', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              });

              trendPoints.push({
                date: dateStr,
                healthScore: results.health_score,
                wqiScore: parseFloat(results.wqi_score),
              });

              paramPoints.push({
                date: dateStr,
                ph: test.ph,
                turbidity: test.turbidity,
                dissolved_oxygen: test.dissolved_oxygen,
                nitrates: test.nitrates,
                phosphates: test.phosphates,
              });
            }
          } catch (err) {
            // If a result fails to load, try to process the test
            try {
              await labTestAPI.processTest(test.id);
              const results = await labTestAPI.getResults(test.id);
              
              if (results && results.health_score !== undefined && results.wqi_score !== undefined) {
                const dateStr = new Date(test.created_at).toLocaleString('en-KE', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                trendPoints.push({
                  date: dateStr,
                  healthScore: results.health_score,
                  wqiScore: parseFloat(results.wqi_score),
                });

                paramPoints.push({
                  date: dateStr,
                  ph: test.ph,
                  turbidity: test.turbidity,
                  dissolved_oxygen: test.dissolved_oxygen,
                  nitrates: test.nitrates,
                  phosphates: test.phosphates,
                });
              }
            } catch (processErr) {
              console.debug(`Could not process test ${test.id}`);
            }
          }
        }

        setTrendData(trendPoints);
        setParameterData(paramPoints);

        // Step 3 — use the most recent test for the main display
        const latestTest = sortedTests[sortedTests.length - 1];
        setTestDate(latestTest.date_of_test || latestTest.created_at);

        // Step 4 — fetch ML results + recommendations for latest test
        let results = null;
        try {
          results = await labTestAPI.getResults(latestTest.id);

          if (!results || !results.parameters) {
            await labTestAPI.processTest(latestTest.id);
            results = await labTestAPI.getResults(latestTest.id);
          }
        } catch {
          const parameters = {
            ph:               latestTest.ph,
            turbidity:        latestTest.turbidity,
            dissolved_oxygen: latestTest.dissolved_oxygen,
            nitrates:         latestTest.nitrates,
            phosphates:       latestTest.phosphates,
            salinity:         latestTest.salinity,
          };
          setKpis(buildKPIs(parameters));
          setHasData(true);
          return;
        }

        // Step 5 — populate all state from the results response
        setKpis(buildKPIs(results.parameters));
        setHealthScore(results.health_score);
        setRiskLevel(results.risk_level);
        setWqiScore(results.wqi_score);
        setRecommendations(results.recommendations || []);
        setHasData(true);

      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load water quality data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.id]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Navigation currentPage="dashboard" onNavigate={onNavigate} user={user} />

      <main className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome to Aqualitcs, {user.name}!</h1>
          <p className="welcome-subtitle">
            Your comprehensive overview of water quality. Monitor key parameters and receive
            actionable recommendations to maintain a healthy environment.
          </p>
          {testDate && (
            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>
              Showing results for most recent test —{' '}
              {new Date(testDate).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          )}
          <button className="welcome-button" onClick={() => onNavigate('labtest')}>
            Upload New Lab Test
          </button>
        </div>

        {/* Loading / Error / No Data states */}
        {loading && <LoadingSpinner />}
        {!loading && error && <ErrorBanner message={error} />}
        {!loading && !error && !hasData && <NoDataBanner onNavigate={onNavigate} />}

        {/* Main content — only shown when data is available */}
        {!loading && !error && hasData && (
          <>

            {/* KPI Grid */}
            <div className="kpi-section">
              <h2 className="section-title">Key Performance Indicators</h2>
              <div className="kpi-grid">
                {kpis.map((item, index) => (
                  <div key={index} className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-icon">{item.icon}</span>
                      <span className="kpi-unit">{item.unit}</span>
                    </div>
                    <h3 className="kpi-label">{item.label}</h3>
                    <div className="kpi-value">
                      {item.value !== null && item.value !== undefined
                        ? parseFloat(item.value).toFixed(2)
                        : '—'}
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* Time Series Trend Charts */}
            <div style={{ marginTop: '32px' }}>
              <h2 className="section-title" style={{ margin: '24px 24px 0' }}>Trend Analysis</h2>
              <div ref={trendChartRef}>
                <HealthAndWQITrendChart trendData={trendData} />
              </div>

              <div ref={paramChartRef}>
                <ParametersTrendChart parameterData={parameterData} />
              </div>
            </div>

            {/* Health Score + Recommendations */}
            <div>
              {/* Health Score */}
              {healthScore !== null && (
                <div className="health-score">
                  <p className="health-score-label">Health Score</p>
                  <div className="health-score-value">{healthScore}%</div>
                  <p className="health-score-label">{getHealthLabel(healthScore)}</p>
                  {wqiScore !== null && (
                    <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
                      WQI: {parseFloat(wqiScore).toFixed(1)} — {riskLevel}
                    </p>
                  )}
                </div>
              )}
              
              {/* Explanation Banner */}
              <ScoreExplanationBanner />

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div className="recommendations-section">
                  <h3 className="section-title">Actionable Recommendations</h3>
                  <ul className="recommendations-list">
                    {recommendations.map((rec, index) => (
                      <li key={rec.id ?? index} className="recommendation-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between',
                                      alignItems: 'center', marginBottom: '4px' }}>
                          <h4 className="recommendations-title">{rec.recommendation_type}</h4>
                          <StatusBadge status={rec.severity_level} />
                        </div>
                        <p className="recommendations-text">{rec.recommendation_text}</p>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Download Button */}
                  <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <button
                      onClick={() => generatePDFReport(
                        healthScore, 
                        wqiScore,
                        recommendations,
                        testDate,
                        trendChartRef,
                        paramChartRef,
                        kpis,
                        user
                      )}
                      style={{
                        padding: '12px 28px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                    >
                      Download Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="footer">
        <div>© 2026 Aqualitcs. All rights reserved.</div>
      </footer>
    </div>
  );
}