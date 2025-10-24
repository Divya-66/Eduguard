import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

import { fetchAuthSession } from 'aws-amplify/auth';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        const response = await axios.get('http://localhost:4000/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setData(response.data);
        setError('');
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard data: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const chartData = {
    labels: data.map(d => d.name),
    datasets: [{
      label: 'Performance Score (%)',
      data: data.map(d => d.performance_score),
      backgroundColor: '#0052CC',
      borderColor: '#003d99',
      borderWidth: 2,
      borderRadius: 4,
      borderSkipped: false,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            family: 'Inter',
            size: 12,
            weight: 600
          },
          color: '#374151'
        }
      },
      title: {
        display: true,
        text: 'Student Performance Overview',
        font: {
          family: 'Inter',
          size: 16,
          weight: 600
        },
        color: '#0052CC'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          font: {
            family: 'Inter',
            size: 11
          },
          color: '#6B7280'
        },
        grid: {
          color: '#E5E7EB'
        }
      },
      x: {
        ticks: {
          font: {
            family: 'Inter',
            size: 11
          },
          color: '#6B7280'
        },
        grid: {
          display: false
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--gray-600)' }}>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="dashboard-header">
        <h2 className="dashboard-title">
          Student Performance Dashboard
        </h2>
        <p className="dashboard-subtitle">
          Real-time analytics and performance metrics
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message" style={{ marginBottom: '1.5rem' }}>
          <p className="error-text">{error}</p>
        </div>
      )}

      {/* Student List */}
      {data.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '1rem' }}>
            📊 Student Performance Summary
          </h3>
          <div className="students-grid">
            {data.map((student, index) => (
              <div key={student.id} className="student-card">
                <div className="student-header">
                  <div className="student-info">
                    <h4>{student.name}</h4>
                    <p>Student ID: {student.id}</p>
                  </div>
                  <div className="student-score">
                    <div className={`score-value ${
                      student.performance_score >= 80 
                        ? 'score-high' 
                        : student.performance_score >= 60 
                        ? 'score-medium' 
                        : 'score-low'
                    }`}>
                      {student.performance_score}%
                    </div>
                    <div className="score-label">
                      Performance
                    </div>
                  </div>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${
                      student.performance_score >= 80 
                        ? 'progress-high' 
                        : student.performance_score >= 60 
                        ? 'progress-medium' 
                        : 'progress-low'
                    }`}
                    style={{ width: `${student.performance_score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      {data.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 className="chart-title">
            📈 Performance Chart
          </h3>
          <div className="chart-container">
            <div className="chart-wrapper">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {data.length === 0 && !error && (
        <div className="no-data">
          <div className="no-data-icon">📊</div>
          <h3>No Data Available</h3>
          <p>Student performance data will appear here once available.</p>
        </div>
      )}

      {/* Statistics Summary */}
      {data.length > 0 && (
        <div className="stats-grid">
          <div className="stat-card stat-blue">
            <div className="stat-value">
              {data.length}
            </div>
            <div className="stat-label">
              Total Students
            </div>
          </div>
          <div className="stat-card stat-green">
            <div className="stat-value">
              {Math.round(data.reduce((sum, student) => sum + student.performance_score, 0) / data.length)}%
            </div>
            <div className="stat-label">
              Average Score
            </div>
          </div>
          <div className="stat-card stat-purple">
            <div className="stat-value">
              {data.filter(student => student.performance_score >= 80).length}
            </div>
            <div className="stat-label">
              High Performers
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;