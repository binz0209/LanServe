import { useEffect, useState } from 'react';
import api from '../../lib/api';
import ImageUpload from '../../components/ImageUpload';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/banners');
      setBanners(res.data || []);
    } catch (err) {
      console.error('Load banners failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.title || !formData.imageUrl) {
        alert('Vui lòng điền đầy đủ tiêu đề và upload hình ảnh!');
        return;
      }

      if (editing) {
        const updateData = {
          title: formData.title,
          imageUrl: formData.imageUrl,
          linkUrl: formData.linkUrl || null,
          order: formData.order || 0,
          isActive: formData.isActive
        };
        await api.put(`/api/banners/${editing.id || editing._id}`, updateData);
      } else {
        // Khi tạo mới, không gửi Id
        const createData = {
          title: formData.title,
          imageUrl: formData.imageUrl,
          linkUrl: formData.linkUrl || null,
          order: formData.order || 0,
          isActive: formData.isActive
        };
        await api.post('/api/banners', createData);
      }
      alert(editing ? 'Cập nhật banner thành công!' : 'Tạo banner thành công!');
      setShowForm(false);
      setEditing(null);
      setFormData({ title: '', imageUrl: '', linkUrl: '', order: 0, isActive: true });
      loadBanners();
    } catch (err) {
      console.error('Save banner failed', err);
      let errorMsg = 'Lưu banner thất bại!';
      
      if (err.response?.status === 401) {
        errorMsg = 'Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại với tài khoản Admin.';
      } else if (err.response?.status === 400) {
        errorMsg = err.response?.data?.detail || err.response?.data?.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
      } else if (err.response?.data) {
        errorMsg = err.response.data.detail || err.response.data.message || err.message;
      }
      
      alert(errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa banner này?')) return;
    try {
      await api.delete(`/api/banners/${id}`);
      alert('Xóa banner thành công!');
      loadBanners();
    } catch (err) {
      console.error('Delete banner failed', err);
      alert('Xóa banner thất bại!');
    }
  };

  const startEdit = (banner) => {
    setEditing(banner);
    setFormData({
      title: banner.title || '',
      imageUrl: banner.imageUrl || '',
      linkUrl: banner.linkUrl || '',
      order: banner.order || 0,
      isActive: banner.isActive !== undefined ? banner.isActive : true,
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setShowForm(false);
    setEditing(null);
    setFormData({ title: '', imageUrl: '', linkUrl: '', order: 0, isActive: true });
  };

  if (loading) {
    return <div className="p-6">Đang tải...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Banners</h1>
          <p className="text-gray-600 mt-1">Quản lý banners hiển thị trên trang chủ</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Thêm Banner</Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editing ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tiêu đề</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Tiêu đề banner"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hình ảnh</label>
              <ImageUpload
                folder="banners"
                onUploadSuccess={(url) => setFormData({ ...formData, imageUrl: url })}
              />
              {formData.imageUrl && (
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="mt-2 w-64 h-32 object-cover rounded"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Link URL (tùy chọn)</label>
              <Input
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Thứ tự hiển thị</label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Trạng thái</label>
                <select
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Tắt</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">{editing ? 'Cập nhật' : 'Tạo mới'}</Button>
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Hủy
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hình ảnh</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Link</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thứ tự</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {banners.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Chưa có banner nào
                </td>
              </tr>
            ) : (
              banners.map((banner) => (
                <tr key={banner.id || banner._id}>
                  <td className="px-6 py-4">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-20 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm">{banner.title}</td>
                  <td className="px-6 py-4 text-sm">
                    {banner.linkUrl ? (
                      <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        Xem link
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">{banner.order}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {banner.isActive ? 'Hoạt động' : 'Tắt'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(banner)}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id || banner._id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


