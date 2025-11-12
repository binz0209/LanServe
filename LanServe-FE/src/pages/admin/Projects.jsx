import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Eye, Edit, Trash2, Plus, X } from 'lucide-react';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';
import { toast } from 'sonner';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Pagination & Lazy Loading
  const [displayedCount, setDisplayedCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef(null);
  const ITEMS_PER_PAGE = 10;
  
  // CRUD Modal
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budgetAmount: '',
    status: 'Open',
    categoryId: ''
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/projects');
      setProjects(response.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Không thể tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(project => 
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  // Reset displayed count when filter changes
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE);
  }, [searchTerm]);

  // Displayed projects (for pagination)
  const displayedProjects = useMemo(() => {
    return filteredProjects.slice(0, displayedCount);
  }, [filteredProjects, displayedCount]);

  // Intersection Observer for infinite scroll
  const loadMoreRef = useRef(null);

  // Auto-load more if content is shorter than viewport
  useEffect(() => {
    if (displayedCount < filteredProjects.length && !loading && !isLoadingMore) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        const scrollContainer = document.querySelector('main.overflow-y-auto');
        const containerHeight = scrollContainer ? scrollContainer.clientHeight : window.innerHeight;
        const contentHeight = scrollContainer ? scrollContainer.scrollHeight : document.documentElement.scrollHeight;
        
        if (contentHeight < containerHeight + 100) {
          setDisplayedCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredProjects.length));
        }
      }, 100);
    }
  }, [displayedCount, filteredProjects.length, loading, isLoadingMore]);

  useEffect(() => {
    // Find the scrollable container (main element in admin layout)
    const scrollContainer = document.querySelector('main.overflow-y-auto') || window;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingMore && displayedCount < filteredProjects.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setDisplayedCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredProjects.length));
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
  }, [isLoadingMore, displayedCount, filteredProjects.length]);

  // CRUD Functions
  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      budgetAmount: '',
      status: 'Open',
      categoryId: categories[0]?.id || ''
    });
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      budgetAmount: project.budgetAmount || project.budget?.value || '',
      status: project.status || 'Open',
      categoryId: project.categoryId || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      budgetAmount: '',
      status: 'Open',
      categoryId: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        // Update
        await api.put(`/api/projects/${editingProject.id}`, {
          title: formData.title,
          description: formData.description,
          budgetAmount: Number(formData.budgetAmount),
          status: formData.status,
          categoryId: formData.categoryId
        });
        toast.success('Cập nhật dự án thành công');
      } else {
        // Create - Note: Need ownerId, might need to get from current user
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          toast.error('Vui lòng đăng nhập');
          return;
        }
        // For admin create, we might need ownerId - using a default or current admin
        await api.post('/api/projects', {
          title: formData.title,
          description: formData.description,
          budgetAmount: Number(formData.budgetAmount),
          status: formData.status,
          categoryId: formData.categoryId,
          ownerId: editingProject?.ownerId || null // Admin might need to specify owner
        });
        toast.success('Tạo dự án thành công');
      }
      closeModal();
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (projectId) => {
    if (!confirm('Bạn có chắc muốn xóa dự án này?')) return;
    
    try {
      await api.delete(`/api/projects/${projectId}`);
      toast.success('Xóa dự án thành công');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa dự án');
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
          <h1 className="text-3xl font-bold text-gray-800">Quản lý dự án</h1>
          <p className="text-gray-600 mt-1">Danh sách tất cả dự án</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Thêm dự án
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-sm">Tổng dự án</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{projects.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-sm">Đang tuyển</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{projects.filter(p => p.status === 'Open').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-sm">Đã đóng</p>
          <p className="text-2xl font-bold text-gray-600 mt-2">{projects.filter(p => p.status === 'Closed').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-sm">Đang làm</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{projects.filter(p => p.status === 'InProgress').length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm dự án..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngân sách</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayedProjects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{project.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">{project.description}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Intl.NumberFormat('vi-VN').format(project.budgetAmount || project.budget?.value || 0)} đ
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    project.status === 'Open' ? 'bg-green-100 text-green-800' :
                    project.status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setViewingProject(project)}
                      className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => openEditModal(project)}
                      className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded"
                      title="Chỉnh sửa"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(project.id)}
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
      {displayedCount < filteredProjects.length && (
        <div ref={loadMoreRef} className="flex items-center justify-center py-4">
          {isLoadingMore ? (
            <Spinner size="md" />
          ) : (
            <div className="text-slate-500 text-sm">Đang tải thêm...</div>
          )}
        </div>
      )}

      {/* End of list indicator */}
      {!loading && displayedCount >= filteredProjects.length && filteredProjects.length > 0 && (
        <div className="text-center py-4 text-slate-500 text-sm">
          Đã hiển thị tất cả {filteredProjects.length} dự án
        </div>
      )}

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Không tìm thấy dự án nào
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingProject ? 'Chỉnh sửa dự án' : 'Thêm dự án mới'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngân sách (đ) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.budgetAmount}
                    onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Open">Open</option>
                    <option value="InProgress">InProgress</option>
                    <option value="Completed">Completed</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục *
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
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
                  {editingProject ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Chi tiết dự án</h2>
              <button onClick={() => setViewingProject(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                <p className="text-gray-900">{viewingProject.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <p className="text-gray-900">{viewingProject.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngân sách</label>
                  <p className="text-gray-900">
                    {new Intl.NumberFormat('vi-VN').format(viewingProject.budgetAmount || viewingProject.budget?.value || 0)} đ
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    viewingProject.status === 'Open' ? 'bg-green-100 text-green-800' :
                    viewingProject.status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {viewingProject.status}
                  </span>
                </div>
              </div>
              {viewingProject.images && viewingProject.images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
                  <div className="grid grid-cols-2 gap-2">
                    {viewingProject.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`Project ${idx + 1}`} className="w-full h-32 object-cover rounded" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setViewingProject(null);
                  openEditModal(viewingProject);
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Chỉnh sửa
              </button>
              <button
                onClick={() => setViewingProject(null)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;


