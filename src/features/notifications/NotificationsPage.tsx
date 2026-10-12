import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../../api/notificationApi';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Bell, CheckCheck, Clock, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { NotificationDto } from '../../types';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: notifData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div className="bg-card p-6 rounded-2xl border border-border shadow-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest text-lime flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-text-primary">Notifications & Alerts</h2>
            <p className="text-xs text-text-secondary">
              Order confirmations, slot reminders, and meal plan insights
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            disabled={markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage-muted hover:bg-sage border border-border text-forest text-xs font-bold transition"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You are completely caught up! We will alert you when orders update or slots require attention."
        />
      ) : (
        <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden shadow-card">
          {notifications.map((n: NotificationDto) => (
            <div
              key={n.id}
              className={`p-4 flex items-start justify-between gap-4 transition ${
                n.read ? 'bg-white' : 'bg-sage-light/60 border-l-4 border-l-forest'
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-text-primary">{n.title}</h4>
                  {!n.read && <Badge variant="lime" size="sm">New</Badge>}
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{n.message}</p>
                <div className="text-[10px] text-text-secondary flex items-center gap-1 pt-1">
                  <Clock className="w-3 h-3 text-forest" />
                  <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {!n.read && (
                <button
                  type="button"
                  onClick={() => markReadMutation.mutate(n.id)}
                  className="p-1.5 rounded-lg bg-card hover:bg-sage border border-border text-forest text-xs shrink-0 transition"
                  title="Mark as read"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
