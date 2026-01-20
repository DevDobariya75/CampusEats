import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/endpoints';
import type { Order } from '../types/api';
import { formatMoney } from '../utils/money';
import { ArrowLeft, Phone, Mail, MapPin, Clock, ChefHat, Truck } from 'lucide-react';

export function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!orderId) return;
      try {
        const res = await api.orders.getDetails(orderId);
        if (mounted) setOrder(res.data);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message || e?.response?.data?.error || 'Failed to load order.';
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '📝';
      case 'confirmed':
        return '✅';
      case 'preparing':
        return '👨‍🍳';
      case 'ready':
        return '📦';
      case 'out_for_delivery':
        return '🚴';
      case 'delivered':
        return '✅';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-200';
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-200';
      case 'preparing':
        return 'bg-purple-500/20 text-purple-200';
      case 'ready':
        return 'bg-emerald-500/20 text-emerald-200';
      case 'out_for_delivery':
        return 'bg-cyan-500/20 text-cyan-200';
      case 'delivered':
        return 'bg-green-500/20 text-green-200';
      default:
        return 'bg-slate-500/20 text-slate-200';
    }
  };

  const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
  const currentStatusIndex = order ? statusFlow.indexOf(order.status) : -1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Orders
        </button>
      </div>

      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Order #{order?._id.slice(-8).toUpperCase()}</h1>
            <p className="mt-2 text-slate-300">
              {order ? new Date(order.createdAt).toLocaleString() : 'Loading...'}
            </p>
          </div>
          <div className="text-right">
            <div className={`rounded-xl px-4 py-2 text-sm font-bold ${getStatusColor(order?.status || '')}`}>
              {getStatusIcon(order?.status || '')} {order?.status.replace('_', ' ').toUpperCase()}
            </div>
            <div className="mt-3 text-2xl font-black text-white">
              {formatMoney(order?.totalPrice || 0)}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {order && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Order Status Timeline */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-white mb-4">Order Status Timeline</h2>
              <div className="space-y-3">
                {statusFlow.map((status, index) => (
                  <div key={status} className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index <= currentStatusIndex
                          ? 'bg-emerald-500/30 text-emerald-200'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {index < currentStatusIndex ? '✓' : index + 1}
                    </div>
                    <div>
                      <div
                        className={`text-sm font-bold ${
                          index <= currentStatusIndex ? 'text-white' : 'text-slate-400'
                        }`}
                      >
                        {status.replace('_', ' ').toUpperCase()}
                      </div>
                      {index <= currentStatusIndex && (
                        <div className="text-xs text-slate-400 mt-1">
                          Completed at {new Date().toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            {order.deliveryAddress && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={20} className="text-cyan-400" />
                  <h2 className="text-lg font-bold text-white">Delivery Location</h2>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-slate-200 text-sm space-y-1">
                  {order.deliveryAddress.campus && (
                    <p>
                      <span className="text-slate-400">Hostel:</span> {order.deliveryAddress.campus}
                    </p>
                  )}
                  {order.deliveryAddress.building && (
                    <p>
                      <span className="text-slate-400">Building:</span> {order.deliveryAddress.building}
                    </p>
                  )}
                  {order.deliveryAddress.room && (
                    <p>
                      <span className="text-slate-400">Room:</span> {order.deliveryAddress.room}
                    </p>
                  )}
                  {order.deliveryAddress.street && (
                    <p>
                      <span className="text-slate-400">Location:</span> {order.deliveryAddress.street}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-white mb-4">Order Items</h2>
              <div className="space-y-3">
                {order.orderItems.map((item) => (
                  <div key={item._id} className="flex items-center justify-between pb-3 border-b border-slate-700 last:border-0">
                    <div>
                      <div className="text-white font-semibold">{item.name}</div>
                      <div className="text-sm text-slate-400">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{formatMoney(item.price * item.quantity)}</div>
                      <div className="text-xs text-slate-400">{formatMoney(item.price)} each</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Info */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-white mb-4">Payment Information</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">Items Total</span>
                  <span className="font-bold text-white">{formatMoney(order.itemsPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Delivery Fee</span>
                  <span className="font-bold text-white">{formatMoney(order.deliveryFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Tax</span>
                  <span className="font-bold text-white">{formatMoney(order.taxPrice)}</span>
                </div>
                <div className="border-t border-slate-700 pt-2 flex justify-between">
                  <span className="text-slate-300">Total</span>
                  <span className="font-bold text-white">{formatMoney(order.totalPrice)}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <span className="text-slate-400">Method: </span>
                  <span className="font-bold text-white">{order.paymentMethod.replace('_', ' ').toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Contacts */}
          <div className="space-y-4">
            {/* Shop Info */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <ChefHat size={20} className="text-orange-400" />
                <h3 className="font-bold text-white">Shop</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-slate-400">Name</div>
                  <div className="text-white font-semibold">{order.shop?.name || 'Loading...'}</div>
                </div>
                {order.shop?.phone && (
                  <div>
                    <div className="text-sm text-slate-400 flex items-center gap-1">
                      <Phone size={14} /> Contact
                    </div>
                    <a
                      href={`tel:${order.shop.phone}`}
                      className="text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      {order.shop.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Partner Info */}
            {['out_for_delivery', 'delivered'].includes(order.status) && order.deliveryPerson && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Truck size={20} className="text-cyan-400" />
                  <h3 className="font-bold text-white">Delivery Partner</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-slate-400">Name</div>
                    <div className="text-white font-semibold">{order.deliveryPerson?.name || 'Assigned'}</div>
                  </div>
                  {order.deliveryPerson?.phone && (
                    <div>
                      <div className="text-sm text-slate-400 flex items-center gap-1">
                        <Phone size={14} /> Contact
                      </div>
                      <a
                        href={`tel:${order.deliveryPerson.phone}`}
                        className="text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        {order.deliveryPerson.phone}
                      </a>
                    </div>
                  )}
                  {order.deliveryPerson?.email && (
                    <div>
                      <div className="text-sm text-slate-400 flex items-center gap-1">
                        <Mail size={14} /> Email
                      </div>
                      <a
                        href={`mailto:${order.deliveryPerson.email}`}
                        className="text-blue-400 hover:text-blue-300 break-all text-sm"
                      >
                        {order.deliveryPerson.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Waiting for Assignment */}
            {['pending', 'confirmed', 'preparing', 'ready'].includes(order.status) && (
              <div className="card p-6 bg-blue-500/10 border border-blue-400/20">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={20} className="text-blue-400" />
                  <h3 className="font-bold text-blue-200">Waiting for Delivery</h3>
                </div>
                <p className="text-sm text-blue-100">
                  A delivery partner will be assigned once your order is ready for pickup.
                </p>
              </div>
            )}

            {/* Special Instructions */}
            {order.specialInstructions && (
              <div className="card p-6">
                <h3 className="font-bold text-white mb-3">Special Instructions</h3>
                <p className="text-sm text-slate-300 bg-slate-700/30 rounded p-3">
                  {order.specialInstructions}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
