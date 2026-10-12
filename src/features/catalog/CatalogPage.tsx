import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi, ProductFilterParams } from '../../api/catalogApi';
import { favoriteApi } from '../../api/favoriteApi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { QuantityStepper } from '../../components/common/QuantityStepper';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Store,
  Search,
  Heart,
  Plus,
  SlidersHorizontal,
  Info,
  Check,
  Package,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ProductDto, CategoryDto } from '../../types';

export const CatalogPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [onlyOrganic, setOnlyOrganic] = useState(false);
  const [page, setPage] = useState(0);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories(),
  });

  // Fetch favorites list
  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoriteApi.getFavorites(),
  });

  const favoriteIds = new Set(favorites?.map((f) => f.id) || []);

  // Fetch products
  const filterParams: ProductFilterParams = {
    search: search.trim() || undefined,
    categoryId: selectedCategory || undefined,
    organic: onlyOrganic ? true : undefined,
    page,
    size: 16,
  };

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', filterParams],
    queryFn: () => catalogApi.getProducts(filterParams),
  });

  // Mutations
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (product: ProductDto) => {
      if (favoriteIds.has(product.id)) {
        await favoriteApi.removeFavorite(product.id);
        toast.success(`Removed ${product.name} from favorites`);
      } else {
        await favoriteApi.addFavorite(product.id);
        toast.success(`Added ${product.name} to favorites`);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const handleAddToCart = async (product: ProductDto) => {
    const qty = cartQuantities[product.id] || 1;
    try {
      await addToCart(product.id, qty);
      setCartQuantities((prev) => ({ ...prev, [product.id]: 1 }));
    } catch {
      // Error toasted in context
    }
  };

  const setItemQty = (prodId: string, qty: number) => {
    setCartQuantities((prev) => ({ ...prev, [prodId]: qty }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Search */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest text-lime flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-text-primary">Browse Groceries & Staples</h2>
              <p className="text-xs text-text-secondary">
                Fresh produce, daily essentials, and kitchen pantry items with transparent pricing
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search staples, veggies, pulses..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full pl-9 pr-3 py-2 bg-sage-light border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>
        </div>

        {/* Category Filter Pills & Toggles */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('');
              setPage(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedCategory === ''
                ? 'bg-forest text-white shadow-subtle'
                : 'bg-sage-muted text-text-primary hover:bg-sage'
            }`}
          >
            All Items
          </button>
          {categories?.map((cat: CategoryDto) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat.id
                  ? 'bg-forest text-white shadow-subtle'
                  : 'bg-sage-muted text-text-primary hover:bg-sage'
              }`}
            >
              {cat.name}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-text-primary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyOrganic}
                onChange={(e) => {
                  setOnlyOrganic(e.target.checked);
                  setPage(0);
                }}
                className="w-4 h-4 rounded text-forest focus:ring-forest border-border"
              />
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-state-success" />
                Organic Only
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <LoadingSkeleton type="card" count={8} />
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productsData?.content?.map((product: ProductDto) => {
              const isFav = favoriteIds.has(product.id);
              const qty = cartQuantities[product.id] || 1;

              return (
                <div
                  key={product.id}
                  className="bg-card border border-border rounded-2xl p-4 shadow-card hover:shadow-elevated transition flex flex-col justify-between group"
                >
                  <div>
                    {/* Top image & favorite toggle */}
                    <div className="relative w-full h-36 bg-sage-light rounded-xl overflow-hidden mb-3 border border-border flex items-center justify-center">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <span className="text-4xl">🥬</span>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleFavoriteMutation.mutate(product)}
                        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition ${
                          isFav
                            ? 'bg-rose-50 text-state-error shadow-subtle'
                            : 'bg-white/80 text-text-secondary hover:text-state-error hover:bg-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-state-error' : ''}`} />
                      </button>

                      {product.organic && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-forest text-lime text-[10px] font-black uppercase tracking-wider">
                          Organic
                        </span>
                      )}
                    </div>

                    {/* Title & Unit */}
                    <div
                      className="cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <h3 className="text-sm font-bold text-text-primary hover:text-forest transition line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {product.unit} • {product.brand || 'Farm Fresh'}
                      </p>
                    </div>
                  </div>

                  {/* Price & Add to Cart Action */}
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <div>
                      <span className="text-base font-extrabold text-forest">
                        ₹{product.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <QuantityStepper
                        value={qty}
                        min={1}
                        size="sm"
                        onChange={(newQ) => setItemQty(product.id, newQ)}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        title="Add to Basket"
                        aria-label="Add to Basket"
                        className="p-2 rounded-xl bg-forest hover:bg-forest-deep text-white shadow-subtle transition active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-lime" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {productsData && productsData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-bold disabled:opacity-40"
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
                className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={selectedProduct.name}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="h-44 rounded-2xl bg-sage-light overflow-hidden flex items-center justify-center border border-border">
              {selectedProduct.imageUrl ? (
                <img src={selectedProduct.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl">🥦</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl font-black text-forest">
                  ₹{selectedProduct.price.toFixed(2)}
                </span>
                <span className="text-xs text-text-secondary ml-1">/ {selectedProduct.unit}</span>
              </div>
              {selectedProduct.organic && <Badge variant="lime">Certified Organic</Badge>}
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              {selectedProduct.description || 'Sourced fresh from certified partner farms and mills.'}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs bg-sage-light p-3 rounded-xl border border-border">
              <div>
                <span className="text-text-secondary block">Brand / Origin</span>
                <strong className="text-text-primary">{selectedProduct.brand || 'Basketly Fresh'}</strong>
              </div>
              <div>
                <span className="text-text-secondary block">Shelf Life</span>
                <strong className="text-text-primary">{selectedProduct.shelfLifeDays || 5} days</strong>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  handleAddToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-forest hover:bg-forest-deep text-white font-bold text-xs rounded-xl shadow-card transition"
              >
                <ShoppingBag className="w-4 h-4 text-lime" />
                <span>Add to Basket</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
