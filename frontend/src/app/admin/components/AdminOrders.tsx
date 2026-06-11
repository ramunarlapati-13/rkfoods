'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Order } from '@/lib/types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-900/30 text-yellow-400',
  confirmed: 'bg-blue-900/30 text-blue-400',
  processing: 'bg-purple-900/30 text-purple-400',
  shipped: 'bg-indigo-900/30 text-indigo-400',
  delivered: 'bg-green-900/30 text-green-400',
  cancelled: 'bg-red-900/30 text-red-400',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setOrders(data.map((o: any) => ({
          id: o.id,
          userId: o.user_id,
          items: o.items,
          totalAmount: Number(o.total_amount),
          status: o.status,
          customerName: o.customer_name,
          customerPhone: o.customer_phone,
          customerEmail: o.customer_email,
          shippingAddress: o.shipping_address,
          trackingId: o.tracking_id || undefined,
          createdAt: new Date(o.created_at),
          updatedAt: new Date(o.updated_at),
        })));
      } catch (err) {
        console.error('Error fetching orders from Supabase:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) throw error;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: status as Order['status'] } : o)));
    } catch (err) {
      console.error('Error updating order status in Supabase:', err);
    }
  };

  if (loading) return <div className="skeleton h-48 rounded-2xl" />;

  return (
    <div>
      <h2 className="font-display font-bold text-2xl mb-6" style={{ color: 'var(--text-primary)' }}>Orders</h2>
      {orders.length === 0 ? (
        <div className="card p-12 text-center" style={{ color: 'var(--text-secondary)' }}>
          <p className="text-5xl mb-4">📦</p>
          <p>No orders yet. They'll appear here once customers start ordering.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Update Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-white/3 transition-colors" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3 font-mono text-xs text-ochre">{order.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{order.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{order.items?.length ?? 0} items</td>
                    <td className="px-4 py-3 font-bold text-ochre">₹{order.totalAmount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        id={`admin-order-status-${order.id}`}
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="text-xs border rounded-lg px-2 py-1 bg-transparent outline-none focus:border-ochre transition-colors"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                      >
                        {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
