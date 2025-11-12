import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Eye, Edit, Trash2, X } from 'lucide-react';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';
import { toast } from 'sonner';

const Contracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Lazy Loading
  const [displayedCount, setDisplayedCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef(null);
  const ITEMS_PER_PAGE = 10;
  
  // CRUD Modal
  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [viewingContract, setViewingContract] = useState(null);
  const [formData, setFormData] = useState({
    status: 'Active'
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/contracts');
      setContracts(response.data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error('Không thể tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  // Displayed contracts (for pagination)
  const displayedContracts = useMemo(() => {
    return contracts.slice(0, displayedCount);
  }, [contracts, displayedCount]);

  // Intersection Observer for infinite scroll
  const loadMoreRef = useRef(null);

  // Auto-load more if content is shorter than viewport
  useEffect(() => {
    if (displayedCount < contracts.length && !loading && !isLoadingMore) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        const scrollContainer = document.querySelector('main.overflow-y-auto');
        const containerHeight = scrollContainer ? scrollContainer.clientHeight : window.innerHeight;
        const contentHeight = scrollContainer ? scrollContainer.scrollHeight : document.documentElement.scrollHeight;
        
        if (contentHeight < containerHeight + 100) {
          setDisplayedCount(prev => Math.min(prev + ITEMS_PER_PAGE, contracts.length));
        }
      }, 100);
    }
  }, [displayedCount, contracts.length, loading, isLoadingMore]);

  useEffect(() => {
    // Find the scrollable container (main element in admin layout)
    const scrollContainer = document.querySelector('main.overflow-y-auto') || window;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingMore && displayedCount < contracts.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setDisplayedCount(prev => Math.min(prev + ITEMS_PER_PAGE, contracts.length));
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
  }, [isLoadingMore, displayedCount, contracts.length]);

  // CRUD Functions
  const openEditModal = (contract) => {
    setEditingContract(contract);
    setFormData({
      status: contract.status || 'Active'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingContract(null);
    setFormData({ status: 'Active' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/contracts/${editingContract.id}`, {
        ...editingContract,
        status: formData.status
      });
      toast.success('Cập nhật hợp đồng thành công');
      closeModal();
      fetchContracts();
    } catch (error) {
      console.error('Error updating contract:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (contractId) => {
    if (!confirm('Bạn có chắc muốn xóa hợp đồng này?')) return;
    
    try {
      await api.delete(`/api/contracts/${contractId}`);
      toast.success('Xóa hợp đồng thành công');
      fetchContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa hợp đồng');
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý hợp đồng</h1>
        <p className="text-gray-600 mt-1">Danh sách tất cả hợp đồng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-sm">Tổng hợp đồng</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{contracts.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-sm">Đang làm</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {contracts.filter(c => c.status === 'Active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-sm">Hoàn thành</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {contracts.filter(c => c.status === 'Completed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-sm">Đã hủy</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {contracts.filter(c => c.status === 'Cancelled').length}
          </p>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Freelancer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayedContracts.map((contract) => (
              <tr key={contract.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{contract.id?.slice(-8) || contract._id?.slice(-8)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contract.clientId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contract.freelancerId}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    contract.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                    contract.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {contract.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setViewingContract(contract)}
                      className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                      title="Xem chi tiết"
                    >
                    <Eye size={18} />
                  </button>
                    <button 
                      onClick={() => openEditModal(contract)}
                      className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded"
                      title="Chỉnh sửa"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(contract.id || contract._id)}
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
      {displayedCount < contracts.length && (
        <div ref={loadMoreRef} className="flex items-center justify-center py-4">
          {isLoadingMore ? (
            <Spinner size="md" />
          ) : (
            <div className="text-slate-500 text-sm">Đang tải thêm...</div>
          )}
        </div>
      )}

      {/* End of list indicator */}
      {!loading && displayedCount >= contracts.length && contracts.length > 0 && (
        <div className="text-center py-4 text-slate-500 text-sm">
          Đã hiển thị tất cả {contracts.length} hợp đồng
        </div>
      )}

      {contracts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Không có hợp đồng nào
        </div>
      )}

      {/* Edit Modal */}
      {showModal && editingContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Chỉnh sửa hợp đồng</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
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
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Chi tiết hợp đồng</h2>
              <button onClick={() => setViewingContract(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                  <p className="text-gray-900">#{viewingContract.id?.slice(-8) || viewingContract._id?.slice(-8)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    viewingContract.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                    viewingContract.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {viewingContract.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                  <p className="text-gray-900">{viewingContract.clientId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Freelancer ID</label>
                  <p className="text-gray-900">{viewingContract.freelancerId}</p>
                </div>
              </div>
              {viewingContract.agreedAmount && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền thỏa thuận</label>
                  <p className="text-gray-900">
                    {new Intl.NumberFormat('vi-VN').format(viewingContract.agreedAmount)} đ
                  </p>
                </div>
              )}
              {viewingContract.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
                  <p className="text-gray-900">
                    {new Date(viewingContract.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setViewingContract(null);
                  openEditModal(viewingContract);
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Chỉnh sửa
              </button>
              <button
                onClick={() => setViewingContract(null)}
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

export default Contracts;


