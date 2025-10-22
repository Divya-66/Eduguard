import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

import { fetchAuthSession } from 'aws-amplify/auth';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        const response = await axios.get('http://<ec2-public-ip>:3000/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setData(response.data);
      } catch (err) {
        console.error('Dashboard error:', err);
      }
    };
    
    fetchDashboardData();
  }, []);

  const chartData = {
    labels: data.map(d => d.name),
    datasets: [{
      label: 'Performance Score',
      data: data.map(d => d.performance_score),
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }],
  };

  return (
    <div>
      <h2>Student Performance Dashboard</h2>
      <ul>
        {data.map(student => (
          <li key={student.id}>{student.name}: {student.performance_score}%</li>
        ))}
      </ul>
      <Bar data={chartData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
    </div>
  );
};

export default Dashboard;