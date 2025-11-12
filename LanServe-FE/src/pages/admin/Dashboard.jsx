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
    totalRevenue: 0,
    userChange: 0,
    projectChange: 0,
    contractChange: 0,
    revenueChange: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helper function to calculate percentage change
  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Helper function to format change percentage
  const formatChange = (change) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(0)}%`;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      // Get all users
      const usersRes = await api.get('/api/users').catch(err => {
        console.error('Failed to fetch users:', err);
        return { data: [] };
      });
      const users = usersRes.data || [];
      const totalUsers = users.length;
      
      // Calculate users this month vs last month
      const usersThisMonth = users.filter(u => {
        const createdAt = new Date(u.createdAt || u.CreatedAt);
        return createdAt >= startOfThisMonth;
      }).length;
      const usersLastMonth = users.filter(u => {
        const createdAt = new Date(u.createdAt || u.CreatedAt);
        return createdAt >= startOfLastMonth && createdAt <= endOfLastMonth;
      }).length;
      const userChange = calculateChange(usersThisMonth, usersLastMonth);

      // Get all projects
      const projectsRes = await api.get('/api/projects').catch(err => {
        console.error('Failed to fetch projects:', err);
        return { data: [] };
      });
      const projects = projectsRes.data || [];
      const totalProjects = projects.length;
      
      // Calculate projects this month vs last month
      const projectsThisMonth = projects.filter(p => {
        const createdAt = new Date(p.createdAt || p.CreatedAt);
        return createdAt >= startOfThisMonth;
      }).length;
      const projectsLastMonth = projects.filter(p => {
        const createdAt = new Date(p.createdAt || p.CreatedAt);
        return createdAt >= startOfLastMonth && createdAt <= endOfLastMonth;
      }).length;
      const projectChange = calculateChange(projectsThisMonth, projectsLastMonth);

      // Get all contracts
      const contractsRes = await api.get('/api/contracts').catch(err => {
        console.error('Failed to fetch contracts:', err);
        return { data: [] };
      });
      const contracts = contractsRes.data || [];
      const totalContracts = contracts.length;
      
      // Calculate contracts this month vs last month
      const contractsThisMonth = contracts.filter(c => {
        const createdAt = new Date(c.createdAt || c.CreatedAt);
        return createdAt >= startOfThisMonth;
      }).length;
      const contractsLastMonth = contracts.filter(c => {
        const createdAt = new Date(c.createdAt || c.CreatedAt);
        return createdAt >= startOfLastMonth && createdAt <= endOfLastMonth;
      }).length;
      const contractChange = calculateChange(contractsThisMonth, contractsLastMonth);

      // Calculate revenue from completed contracts
      const completedContracts = contracts.filter(c => 
        (c.status || c.Status) === 'Completed' || (c.status || c.Status) === 'completed'
      );
      const totalRevenue = completedContracts.reduce((sum, c) => {
        const amount = c.agreedAmount || c.AgreedAmount || 0;
        return sum + (typeof amount === 'number' ? amount : parseFloat(amount) || 0);
      }, 0);
      
      // Calculate revenue this month vs last month
      const revenueThisMonth = completedContracts
        .filter(c => {
          const createdAt = new Date(c.createdAt || c.CreatedAt);
          return createdAt >= startOfThisMonth;
        })
        .reduce((sum, c) => {
          const amount = c.agreedAmount || c.AgreedAmount || 0;
          return sum + (typeof amount === 'number' ? amount : parseFloat(amount) || 0);
        }, 0);
      
      const revenueLastMonth = completedContracts
        .filter(c => {
          const createdAt = new Date(c.createdAt || c.CreatedAt);
          return createdAt >= startOfLastMonth && createdAt <= endOfLastMonth;
        })
        .reduce((sum, c) => {
          const amount = c.agreedAmount || c.AgreedAmount || 0;
          return sum + (typeof amount === 'number' ? amount : parseFloat(amount) || 0);
        }, 0);
      const revenueChange = calculateChange(revenueThisMonth, revenueLastMonth);

      setStats({
        totalUsers,
        totalProjects,
        totalContracts,
        totalRevenue,
        userChange,
        projectChange,
        contractChange,
        revenueChange
      });

      // Calculate chart data from actual data
      // Revenue chart - last 6 months
      const revenueChartData = [];
      for (let i = 5; i >= 0; i--) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);
        
        const monthRevenue = completedContracts
          .filter(c => {
            const createdAt = new Date(c.createdAt || c.CreatedAt);
            return createdAt >= monthStart && createdAt <= monthEnd;
          })
          .reduce((sum, c) => {
            const amount = c.agreedAmount || c.AgreedAmount || 0;
            return sum + (typeof amount === 'number' ? amount : parseFloat(amount) || 0);
          }, 0);
        
        revenueChartData.push({
          month: `Th ${targetDate.getMonth() + 1}`,
          doanhThu: monthRevenue,
          chiPhi: monthRevenue * 0.6 // Estimate costs as 60% of revenue
        });
      }
      setRevenueData(revenueChartData);

      // Projects chart - last 7 days
      const projectChartData = [];
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(now);
        dayStart.setDate(dayStart.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        
        const dayProjects = projects.filter(p => {
          const createdAt = new Date(p.createdAt || p.CreatedAt);
          return createdAt >= dayStart && createdAt <= dayEnd;
        }).length;
        
        projectChartData.push({
          day: dayNames[dayStart.getDay()],
          projects: dayProjects
        });
      }
      setProjectData(projectChartData);

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
    { 
      name: 'Tổng người dùng', 
      value: stats.totalUsers, 
      icon: Users, 
      color: 'bg-blue-500', 
      change: formatChange(stats.userChange),
      changeColor: stats.userChange >= 0 ? 'text-green-600' : 'text-red-600'
    },
    { 
      name: 'Dự án', 
      value: stats.totalProjects, 
      icon: FolderKanban, 
      color: 'bg-green-500', 
      change: formatChange(stats.projectChange),
      changeColor: stats.projectChange >= 0 ? 'text-green-600' : 'text-red-600'
    },
    { 
      name: 'Hợp đồng', 
      value: stats.totalContracts, 
      icon: FileText, 
      color: 'bg-purple-500', 
      change: formatChange(stats.contractChange),
      changeColor: stats.contractChange >= 0 ? 'text-green-600' : 'text-red-600'
    },
    { 
      name: 'Doanh thu', 
      value: stats.totalRevenue >= 1000000 
        ? `${(stats.totalRevenue / 1000000).toFixed(1)}M` 
        : stats.totalRevenue >= 1000 
        ? `${(stats.totalRevenue / 1000).toFixed(1)}K` 
        : stats.totalRevenue.toFixed(0), 
      icon: DollarSign, 
      color: 'bg-orange-500', 
      change: formatChange(stats.revenueChange),
      changeColor: stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
    },
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
                  <p className={`${stat.changeColor} text-sm mt-1`}>{stat.change} so với tháng trước</p>
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


