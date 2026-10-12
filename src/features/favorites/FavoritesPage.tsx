import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteApi } from '../../api/favoriteApi';
import { useCart } from '../../context/CartContext';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProductDto } from '../../types';

export const FavoritesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToCart } = useCart();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoriteApi.getFavorites(),
  });

  const removeFavMutation = useMutation({
    mutationFn: (productId: string) => favoriteApi.removeFavorite(productId),
    onSuccess: () => {
      toast.success('Removed from favorites');
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const handleAddToCart = async (product: ProductDto) => {
    try {
      await addToCart(product.id, 1);
    } catch {
      // Handled
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-card p-6 rounded-2xl border border-border shadow-card flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-forest text-lime flex items-center justify-center shrink-0">
          <Heart className="w-5 h-5 fill-lime" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-text-primary">Saved Favorites</h2>
          <p className="text-xs text-text-secondary">
            Quickly re-order your household essentials and preferred staples
          </p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : !favorites || favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites saved yet"
          description="Click the heart icon on any grocery item to save it here for fast reordering."
          actionText="Browse Groceries"
          onAction={() => (window.location.href = '/catalog')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((product) => (
            <div
              key={product.id}
              className="bg-card border border-border rounded-2xl p-4 shadow-card hover:shadow-elevated transition flex flex-col justify-between"
            >
              <div>
                <div className="relative w-full h-36 bg-sage-light rounded-xl overflow-hidden mb-3 border border-border flex items-center justify-center">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">🥭</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFavMutation.mutate(product.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white text-state-error shadow-subtle hover:bg-rose-50 transition"
                    title="Remove favorite"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-text-primary truncate">{product.name}</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  {product.unit} • {product.brand || 'Farm Fresh'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-base font-extrabold text-forest">
                  ₹{product.price.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  className="px-3 py-1.5 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-subtle flex items-center gap-1.5 transition active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-lime" />
                  <span>Add to Basket</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
