import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Edit, Trash2, Plus, X } from 'lucide-react';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';
import { toast } from 'sonner';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Pagination & Lazy Loading
  const [displayedCount, setDisplayedCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef(null);
  const ITEMS_PER_PAGE = 10;
  
  // CRUD Modal
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    role: 'User',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users');
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });
  }, [users, searchTerm, roleFilter]);

  // Reset displayed count when filter changes
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE);
  }, [searchTerm, roleFilter]);

  // Displayed users (for pagination)
  const displayedUsers = useMemo(() => {
    return filteredUsers.slice(0, displayedCount);
  }, [filteredUsers, displayedCount]);

  // Intersection Observer for infinite scroll
  const loadMoreRef = useRef(null);

  // Auto-load more if content is shorter than viewport
  useEffect(() => {
    if (displayedCount < filteredUsers.length && !loading && !isLoadingMore) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        const scrollContainer = document.querySelector('main.overflow-y-auto');
        const containerHeight = scrollContainer ? scrollContainer.clientHeight : window.innerHeight;
        const contentHeight = scrollContainer ? scrollContainer.scrollHeight : document.documentElement.scrollHeight;
        
        if (contentHeight < containerHeight + 100) {
          // Content is shorter than viewport, load more
          setDisplayedCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredUsers.length));
        }
      }, 100);
    }
  }, [displayedCount, filteredUsers.length, loading, isLoadingMore]);

  useEffect(() => {
    // Find the scrollable container (main element in admin layout)
    const scrollContainer = document.querySelector('main.overflow-y-auto') || window;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingMore && displayedCount < filteredUsers.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setDisplayedCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredUsers.length));
            setIsLoadingMore(false);
          }, 300);
        }
      },
      {
        root: scrollContainer === window ? null : scrollContainer,
        rootMargin: '200px',
        threshold: 0.1
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [isLoadingMore, displayedCount, filteredUsers.length]);

  // CRUD Functions
  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ email: '', fullName: '', role: 'User', password: '' });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      fullName: user.fullName || '',
      role: user.role || 'User',
      password: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ email: '', fullName: '', role: 'User', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update
        const payload = {
          fullName: formData.fullName,
          role: formData.role
        };
        if (formData.password) {
          // Note: Backend might need a separate endpoint for password change
          payload.password = formData.password;
        }
        await api.put(`/api/users/${editingUser.id}`, payload);
        toast.success('Cập nhật người dùng thành công');
      } else {
        // Create
        await api.post('/api/users', {
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role,
          password: formData.password
        });
        toast.success('Tạo người dùng thành công');
      }
      closeModal();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    
    try {
      await api.delete(`/api/users/${userId}`);
      toast.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa người dùng');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div ref={scrollContainerRef}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý người dùng</h1>
          <p className="text-gray-600 mt-1">Danh sách tất cả người dùng trong hệ thống</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Thêm người dùng
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo email, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả vai trò</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.fullName || user.username || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditModal(user)}
                      className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                      title="Chỉnh sửa"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Loading trigger element */}
      {displayedCount < filteredUsers.length && (
        <div ref={loadMoreRef} className="flex items-center justify-center py-4">
          {isLoadingMore ? (
            <Spinner size="md" />
          ) : (
            <div className="text-slate-500 text-sm">Đang tải thêm...</div>
          )}
        </div>
      )}

      {/* End of list indicator */}
      {!loading && displayedCount >= filteredUsers.length && filteredUsers.length > 0 && (
        <div className="text-center py-4 text-slate-500 text-sm">
          Đã hiển thị tất cả {filteredUsers.length} người dùng
        </div>
      )}

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Không tìm thấy người dùng nào
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingUser ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;


