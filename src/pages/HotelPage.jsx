import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { Plus, Loader2 } from 'lucide-react';
import HotelTable from '../components/hotels/HotelTable';
import HotelFormModal from '../components/hotels/HotelFormModal';
import DeleteHotelModal from '../components/hotels/DeleteHotelModal';

function HotelPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [deletingHotel, setDeletingHotel] = useState(null);

  // --- QUERIES ---
  const { data: hotels, isLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: () => api.get('/hotels').then((res) => res.data),
  });

  // --- MUTATIONS ---
  const createMutation = useMutation({
    mutationFn: (newHotel) => api.post('/hotels', newHotel),
    onSuccess: () => {
      queryClient.invalidateQueries(['hotels']);
      setIsFormOpen(false);
      alert('Hotel added successfully');
    },
    onError: (err) =>
      alert(err.response?.data?.message || 'Failed to add hotel'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/hotels/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['hotels']);
      setIsFormOpen(false);
      setEditingHotel(null);
      alert('Hotel updated successfully');
    },
    onError: (err) =>
      alert(err.response?.data?.message || 'Failed to update hotel'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, password }) =>
      api.delete(`/hotels/${id}`, { data: { password } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['hotels']);
      setDeletingHotel(null);
      alert('Hotel deleted successfully');
    },
    onError: (err) =>
      alert(err.response?.data?.message || 'Failed to delete hotel'),
  });

  // --- HANDLERS ---
  const handleAdd = () => {
    setEditingHotel(null);
    setIsFormOpen(true);
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (hotel) => {
    setDeletingHotel(hotel);
  };

  const handleFormSubmit = (formData) => {
    if (editingHotel) {
      updateMutation.mutate({ id: editingHotel.hotel_id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteConfirm = (password) => {
    if (deletingHotel) {
      deleteMutation.mutate({ id: deletingHotel.hotel_id, password });
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="font-montserrat space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Hotel Management
          </h1>
          <p className="text-slate-500 text-sm">
            Add, update, or remove hotel data.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Hotel
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <HotelTable
          hotels={hotels}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </div>

      {/* --- MODALS --- */}
      {isFormOpen && (
        <HotelFormModal
          // FIX: Add a key to force re-initialization when the editing target changes
          key={editingHotel ? editingHotel.hotel_id : 'create-new'}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingHotel}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {deletingHotel && (
        <DeleteHotelModal
          isOpen={!!deletingHotel}
          hotelName={deletingHotel.nama_hotel}
          onClose={() => setDeletingHotel(null)}
          onConfirm={handleDeleteConfirm}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

export default HotelPage;
