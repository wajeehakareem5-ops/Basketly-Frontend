import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../../api/catalogApi';
import { adminApi, ProductPayload } from '../../api/adminApi';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ProductDto, CategoryDto } from '../../types';

export const AdminInventoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [page, setPage] = useState<number>(0);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);

  // Form state
  const initialFormState: ProductPayload = {
    name: '',
    categoryId: '',
    price: 50,
    packageSize: '1 kg',
    unit: 'kg',
    stockQuantity: 100,
    isAvailable: true,
    organic: false,
    brand: 'Farm Fresh',
    imageUrl: '',
    description: '',
    shelfLifeDays: 7,
  };
  const [formData, setFormData] = useState<ProductPayload>(initialFormState);

  // Queries
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories(),
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['adminProducts', search, selectedCategory, page],
    queryFn: () =>
      catalogApi.getProducts({
        search: search.trim() || undefined,
        categoryId: selectedCategory || undefined,
        page,
        size: 15,
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: ProductPayload) => adminApi.createProduct(payload),
    onSuccess: (newProd) => {
      toast.success(`Product "${newProd.name}" created!`);
      setShowAddModal(false);
      setFormData(initialFormState);
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductPayload }) =>
      adminApi.updateProduct(id, payload),
    onSuccess: (updated) => {
      toast.success(`Product "${updated.name}" updated!`);
      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update product');
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      adminApi.updateAvailability(id, isAvailable),
    onSuccess: (updated) => {
      toast.success(
        `"${updated.name}" marked as ${updated.isAvailable ? 'In Stock' : 'Out of Stock'}`
      );
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      toast.success('Product removed from catalog');
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleOpenEdit = (p: ProductDto) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      categoryId: p.categoryId || (categories && categories[0]?.id) || '',
      price: p.price,
      packageSize: p.packageSize || '1 kg',
      unit: p.unit || 'kg',
      stockQuantity: p.stockQuantity || 100,
      isAvailable: p.isAvailable !== false,
      organic: !!p.organic,
      brand: p.brand || '',
      imageUrl: p.imageUrl || '',
      description: p.description || '',
      shelfLifeDays: p.shelfLifeDays || 7,
    });
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      ...initialFormState,
      categoryId: (categories && categories[0]?.id) || '',
    });
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.categoryId && categories && categories.length > 0) {
      formData.categoryId = categories[0].id;
    }
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest text-lime flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-text-primary">Catalog & Inventory Management</h2>
            <p className="text-xs text-text-secondary">
              Update pricing, maintain stock thresholds, and add new grocery items
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-card transition"
        >
          <Plus className="w-4 h-4 text-lime" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-card p-4 rounded-2xl border border-border flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full pl-9 pr-3 py-2 bg-sage-light border border-border rounded-xl text-xs focus:ring-forest"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 bg-sage-light border border-border rounded-xl text-xs font-semibold"
          >
            <option value="">All Categories</option>
            {categories?.map((c: CategoryDto) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      {isLoading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-sage-light text-text-secondary uppercase text-[10px] font-bold border-b border-border">
                <tr>
                  <th className="px-5 py-3">Product Name</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock Units</th>
                  <th className="px-5 py-3">Availability</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {productsData?.content?.map((prod: ProductDto) => {
                  const isLow = (prod.stockQuantity || 0) <= 10;
                  const isAvailable = prod.isAvailable !== false;

                  return (
                    <tr key={prod.id} className="hover:bg-sage-light/50 transition">
                      <td className="px-5 py-3">
                        <div className="font-bold text-text-primary text-sm">{prod.name}</div>
                        <div className="text-[10px] text-text-secondary">
                          {prod.packageSize || '1 unit'} • {prod.brand || 'Farm Fresh'}
                          {prod.organic && (
                            <span className="ml-1 text-forest font-semibold">🌱 Organic</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-text-secondary">
                        {prod.categoryName || 'General'}
                      </td>
                      <td className="px-5 py-3 font-black text-forest text-sm">
                        ₹{prod.price.toFixed(2)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`font-extrabold ${
                            isLow ? 'text-state-warning' : 'text-text-primary'
                          }`}
                        >
                          {prod.stockQuantity || 0}
                        </span>
                        {isLow && (
                          <span className="ml-1 text-[10px] text-state-warning font-semibold">
                            (Low)
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            toggleAvailabilityMutation.mutate({
                              id: prod.id,
                              isAvailable: !isAvailable,
                            })
                          }
                          className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                            isAvailable
                              ? 'bg-emerald-100 text-state-success hover:bg-emerald-200'
                              : 'bg-rose-100 text-state-error hover:bg-rose-200'
                          }`}
                        >
                          {isAvailable ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 rounded-lg text-forest hover:bg-sage transition"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${prod.name}"?`)) {
                              deleteMutation.mutate(prod.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-state-error hover:bg-rose-50 transition"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {productsData && productsData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-text-secondary px-2">
                Page {page + 1} of {productsData.totalPages}
              </span>
              <button
                type="button"
                disabled={page + 1 >= productsData.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {(showAddModal || editingProduct) && (
        <Modal
          isOpen={showAddModal || !!editingProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          title={editingProduct ? `Edit ${editingProduct.name}` : 'Add New Grocery Product'}
          maxWidth="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Organic Alphonso Mangoes"
                  className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl font-bold"
                >
                  {categories?.map((c: CategoryDto) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                  Stock Units Available *
                </label>
                <input
                  type="number"
                  required
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                  Package Size & Unit
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.packageSize}
                    onChange={(e) => setFormData({ ...formData, packageSize: e.target.value })}
                    placeholder="e.g. 500 g"
                    className="flex-1 px-3 py-2 bg-sage-light border border-border rounded-xl"
                  />
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="pack/kg"
                    className="w-20 px-3 py-2 bg-sage-light border border-border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                  Brand / Producer
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. Organic Tattva"
                  className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                Image URL (optional)
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/item.png"
                className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Freshly harvested farm produce..."
                className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl"
              />
            </div>

            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-1.5 font-bold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.organic}
                  onChange={(e) => setFormData({ ...formData, organic: e.target.checked })}
                  className="w-4 h-4 rounded text-forest focus:ring-forest"
                />
                <span>Certified Organic</span>
              </label>

              <label className="flex items-center gap-1.5 font-bold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 rounded text-forest focus:ring-forest"
                />
                <span>Active / In Stock</span>
              </label>
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                }}
                className="px-4 py-2 font-bold text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-5 py-2.5 bg-forest hover:bg-forest-deep text-white font-black rounded-xl shadow-card transition active:scale-95"
              >
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
