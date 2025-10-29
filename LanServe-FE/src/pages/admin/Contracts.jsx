import React, { useState, useEffect } from 'react';
import { Eye, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';

const Contracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div>
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
            {contracts.map((contract) => (
              <tr key={contract.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{contract.id?.slice(-8)}</td>
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
                  <button className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {contracts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Không có hợp đồng nào
        </div>
      )}
    </div>
  );
};

export default Contracts;


