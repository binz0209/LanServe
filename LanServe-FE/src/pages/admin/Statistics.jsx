import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { api } from '../../lib/api';

const Statistics = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [projectData, setProjectData] = useState([]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      // Get payments for revenue calculation
      const paymentsRes = await api.get('/api/payments');
      const payments = paymentsRes.data || [];
      
      // Mock revenue data
      setRevenueData([
        { month: 'Th 1', revenue: 12000000, profit: 4000000 },
        { month: 'Th 2', revenue: 19000000, profit: 7000000 },
        { month: 'Th 3', revenue: 15000000, profit: 5000000 },
        { month: 'Th 4', revenue: 22000000, profit: 8000000 },
        { month: 'Th 5', revenue: 28000000, profit: 12000000 },
        { month: 'Th 6', revenue: 35000000, profit: 17000000 },
      ]);

      // Get categories
      const categoriesRes = await api.get('/api/categories');
      const categories = categoriesRes.data || [];
      
      // Mock category distribution
      setCategoryData([
        { name: 'Web Development', value: 45, color: '#3b82f6' },
        { name: 'Mobile App', value: 25, color: '#10b981' },
        { name: 'Design', value: 20, color: '#f59e0b' },
        { name: 'Other', value: 10, color: '#ef4444' },
      ]);

      // Mock project data
      setProjectData([
        { day: 'T2', projects: 45 },
        { day: 'T3', projects: 52 },
        { day: 'T4', projects: 48 },
        { day: 'T5', projects: 61 },
        { day: 'T6', projects: 55 },
        { day: 'T7', projects: 78 },
        { day: 'CN', projects: 82 },
      ]);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Thống kê chi tiết</h1>
        <p className="text-gray-600 mt-1">Phân tích và báo cáo chi tiết</p>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Biểu đồ doanh thu và lợi nhuận</h2>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN').format(value)} />
            <Legend />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            <Area type="monotone" dataKey="profit" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Phân loại dự án</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Dự án theo tuần</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="projects" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-gray-600 text-sm mb-2">Tổng doanh thu</h3>
          <p className="text-3xl font-bold text-gray-800">VNĐ 131M</p>
          <p className="text-green-600 text-sm mt-2">↗ Tăng 23%</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-gray-600 text-sm mb-2">Tổng lợi nhuận</h3>
          <p className="text-3xl font-bold text-gray-800">VNĐ 53M</p>
          <p className="text-green-600 text-sm mt-2">↗ Tăng 31%</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-gray-600 text-sm mb-2">Tăng trưởng</h3>
          <p className="text-3xl font-bold text-gray-800">+28%</p>
          <p className="text-blue-600 text-sm mt-2">Tăng trưởng tích cực</p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;


