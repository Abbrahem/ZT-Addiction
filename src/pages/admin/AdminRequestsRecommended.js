import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AdminRequestsRecommended = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, request, recommended
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('/api/products/requests-recommended', { withCredentials: true });
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete this entry?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete',
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete('/api/products/requests-recommended', {
        data: { id },
        withCredentials: true,
      });
      setItems(prev => prev.filter(i => i._id !== id));
      Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete' });
    }
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Requests & Recommended ({items.length})</h2>
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto">
          {['all', 'request', 'recommended'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-900'
              }`}
            >
              {f === 'all' ? 'All' : f === 'request' ? 'Requests' : 'Recommended'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 sm:py-16 text-gray-500 text-sm">No entries found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item._id} className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2.5 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${
                    item.type === 'request' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {item.type === 'request' ? '📩 Request' : '✨ Recommended'}
                  </span>
                  {item.category && (
                    <span className="text-[10px] sm:text-xs bg-gray-100 text-gray-600 px-1.5 sm:px-2 py-0.5 rounded-full capitalize whitespace-nowrap">
                      {item.category.replace(/-/g, ' ')}
                    </span>
                  )}
                </div>
                <span className="text-[10px] sm:text-xs text-gray-400 flex-shrink-0">
                  {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                {/* Image */}
                {item.imageBase64 && (
                  <img
                    src={item.imageBase64}
                    alt="perfume"
                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
                    onClick={() => setSelectedImage(item.imageBase64)}
                  />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5">Perfume</p>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{item.perfumeName}</p>
                    </div>
                    {item.type === 'request' && item.name && (
                      <div className="min-w-0">
                        <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5">Name</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      </div>
                    )}
                    {item.type === 'request' && item.phone && (
                      <div className="min-w-0">
                        <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5">Phone</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-800">{item.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(item._id)}
                  className="flex-shrink-0 w-full sm:w-auto px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors mt-2 sm:mt-0"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Lightbox */}
      {selectedImage && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-80 z-50"
            onClick={() => setSelectedImage(null)}
          />
          <div className="fixed inset-4 z-50 flex items-center justify-center">
            <div className="relative max-w-2xl max-h-full">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-10 right-0 text-white text-2xl hover:opacity-70"
              >✕</button>
              <img src={selectedImage} alt="perfume" className="max-w-full max-h-[80vh] rounded-xl object-contain" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminRequestsRecommended;
