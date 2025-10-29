import React, { useState, useEffect } from 'react';
import { Users, FolderKanban, FileText, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { api } from '../../lib/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalContracts: 0,
    totalRevenue: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get all users
      console.log('Fetching users...');
      const usersRes = await api.get('/api/users').catch(err => {
        console.error('Failed to fetch users:', err);
        return { data: [] };
      });
      const totalUsers = usersRes.data?.length || 0;
      console.log('Users fetched:', totalUsers);

      // Get all projects
      console.log('Fetching projects...');
      const projectsRes = await api.get('/api/projects').catch(err => {
        console.error('Failed to fetch projects:', err);
        return { data: [] };
      });
      const totalProjects = projectsRes.data?.length || 0;
      console.log('Projects fetched:', totalProjects);

      // Get all contracts
      console.log('Fetching contracts...');
      const contractsRes = await api.get('/api/contracts').catch(err => {
        console.error('Failed to fetch contracts:', err);
        return { data: [] };
      });
      const totalContracts = contractsRes.data?.length || 0;
      console.log('Contracts fetched:', totalContracts);

      // Get payments for revenue
      console.log('Fetching payments...');
      const paymentsRes = await api.get('/api/payments').catch(err => {
        console.error('Failed to fetch payments:', err);
        return { data: [] };
      });
      const payments = paymentsRes.data || [];
      const totalRevenue = payments
        .filter(p => p.status === 'Success')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      console.log('Payments fetched:', payments.length);

      setStats({
        totalUsers,
        totalProjects,
        totalContracts,
        totalRevenue
      });
      console.log('Stats set:', { totalUsers, totalProjects, totalContracts, totalRevenue });

      // Mock data for charts (replace with actual data)
      setRevenueData([
        { month: 'Th 1', doanhThu: 12000000, chiPhi: 8000000 },
        { month: 'Th 2', doanhThu: 19000000, chiPhi: 12000000 },
        { month: 'Th 3', doanhThu: 15000000, chiPhi: 10000000 },
        { month: 'Th 4', doanhThu: 22000000, chiPhi: 14000000 },
        { month: 'Th 5', doanhThu: 28000000, chiPhi: 16000000 },
        { month: 'Th 6', doanhThu: 35000000, chiPhi: 18000000 },
      ]);

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
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  const statsCards = [
    { name: 'Tổng người dùng', value: stats.totalUsers, icon: Users, color: 'bg-blue-500', change: '+12%' },
    { name: 'Dự án', value: stats.totalProjects, icon: FolderKanban, color: 'bg-green-500', change: '+8%' },
    { name: 'Hợp đồng', value: stats.totalContracts, icon: FileText, color: 'bg-purple-500', change: '+15%' },
    { name: 'Doanh thu', value: `${(stats.totalRevenue / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'bg-orange-500', change: '+5%' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Tổng quan hệ thống LanServe</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  <p className="text-green-600 text-sm mt-1">{stat.change} so với tháng trước</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Doanh thu & Chi phí</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => new Intl.NumberFormat('vi-VN').format(value)}
              />
              <Legend />
              <Line type="monotone" dataKey="doanhThu" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="chiPhi" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Projects Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Dự án theo ngày</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="projects" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


