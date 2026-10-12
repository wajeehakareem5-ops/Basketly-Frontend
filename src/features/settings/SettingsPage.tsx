import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Settings,
  User,
  MapPin,
  Lock,
  Plus,
  Trash2,
  Check,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AddressDto, UserSettingsDto } from '../../types';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState<Omit<AddressDto, 'id'>>({
    label: 'Home',
    recipientName: user?.fullName || '',
    phone: '',
    street: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560001',
    default: true,
  });

  // Queries
  const { data: addresses, isLoading: addrLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => userApi.getAddresses(),
  });

  const { data: settings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: () => userApi.getSettings(),
  });

  // Mutations
  const addAddressMutation = useMutation({
    mutationFn: (data: typeof addressForm) => userApi.createAddress(data),
    onSuccess: () => {
      toast.success('Address saved successfully!');
      setShowAddressModal(false);
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save address');
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => userApi.deleteAddress(id),
    onSuccess: () => {
      toast.success('Address deleted');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (passwords: { oldPassword: string; newPassword: string }) =>
      userApi.changePassword(passwords),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to change password');
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    changePasswordMutation.mutate({ oldPassword, newPassword });
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-card flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-forest text-lime flex items-center justify-center shrink-0">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-text-primary">Settings & Preferences</h2>
          <p className="text-xs text-text-secondary">
            Manage your account credentials, delivery addresses, and grocery limits
          </p>
        </div>
      </div>

      {/* Account Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <User className="w-4 h-4 text-forest" />
          <h3 className="text-sm font-bold text-text-primary">Profile Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-text-secondary block">Full Name</span>
            <strong className="text-sm text-text-primary">{user?.fullName}</strong>
          </div>
          <div>
            <span className="text-text-secondary block">Email Address</span>
            <strong className="text-sm text-text-primary">{user?.email}</strong>
          </div>
          <div>
            <span className="text-text-secondary block">Role</span>
            <Badge variant={user?.role === 'ADMIN' ? 'forest' : 'lime'}>
              {user?.role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Saved Delivery Addresses */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-forest" />
            <h3 className="text-sm font-bold text-text-primary">Saved Delivery Addresses</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowAddressModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-subtle transition"
          >
            <Plus className="w-3.5 h-3.5 text-lime" />
            <span>Add Address</span>
          </button>
        </div>

        {addrLoading ? (
          <LoadingSkeleton type="line" count={2} />
        ) : !addresses || addresses.length === 0 ? (
          <p className="text-xs text-text-secondary py-2">
            No saved delivery addresses. Add your home or office address to enable instant checkout.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {addresses.map((addr: AddressDto) => (
              <div
                key={addr.id}
                className="p-4 bg-sage-light border border-border rounded-xl space-y-2 text-xs flex justify-between items-start"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="font-extrabold text-text-primary">{addr.label}</strong>
                    {addr.default && <Badge variant="lime" size="sm">Default</Badge>}
                  </div>
                  <div className="text-text-secondary">{addr.recipientName} • {addr.phone}</div>
                  <div className="text-text-primary font-medium mt-1">
                    {addr.street}, {addr.city}, {addr.postalCode}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteAddressMutation.mutate(addr.id)}
                  className="p-1 rounded-lg text-text-secondary hover:text-state-error transition"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change Password Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <Lock className="w-4 h-4 text-forest" />
          <h3 className="text-sm font-bold text-text-primary">Change Password</h3>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-3 max-w-md text-xs">
          <div>
            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl focus:ring-forest"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
              New Password (min 8 characters)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl focus:ring-forest"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl focus:ring-forest"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="px-4 py-2.5 bg-forest hover:bg-forest-deep text-white font-bold rounded-xl shadow-card transition active:scale-95 disabled:opacity-50"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="Add Delivery Address"
      >
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                Label
              </label>
              <select
                value={addressForm.label}
                onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl"
              >
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                required
                value={addressForm.recipientName}
                onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              placeholder="10-digit mobile number"
              value={addressForm.phone}
              onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
              className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
              Street Address
            </label>
            <input
              type="text"
              required
              placeholder="Flat/House No, Building, Street, Area"
              value={addressForm.street}
              onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
              className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                City
              </label>
              <input
                type="text"
                required
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                PIN Code
              </label>
              <input
                type="text"
                required
                value={addressForm.postalCode}
                onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddressModal(false)}
              className="px-3 py-2 text-text-secondary font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={addAddressMutation.isPending}
              onClick={() => addAddressMutation.mutate(addressForm)}
              className="px-4 py-2 bg-forest hover:bg-forest-deep text-white font-bold rounded-xl shadow-card transition"
            >
              Save Address
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
