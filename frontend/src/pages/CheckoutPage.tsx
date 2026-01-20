import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { formatMoney } from '../utils/money';

export function CheckoutPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const shop = useCartStore((s) => s.shop);
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'campus_card' | 'online'>('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Delivery location fields
  const [deliveryLocation, setDeliveryLocation] = useState<'hostel' | 'building' | 'custom'>('hostel');
  const [hostelName, setHostelName] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [customLocation, setCustomLocation] = useState('');

  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.menuItem.price * i.quantity, 0),
    [items]
  );

  if (!shop || items.length === 0) {
    return (
      <div className="text-sm text-slate-400">
        Your cart is empty. Please add items first.
      </div>
    );
  }

  const placeOrder = async () => {
    setLoading(true);
    setError(null);
    
    // Build delivery address based on selection
    let deliveryAddress: any = {};
    if (deliveryLocation === 'hostel') {
      if (!hostelName || !roomNumber) {
        setError('Please enter hostel name and room number');
        setLoading(false);
        return;
      }
      deliveryAddress = {
        campus: hostelName,
        room: roomNumber
      };
    } else if (deliveryLocation === 'building') {
      if (!buildingName || !roomNumber) {
        setError('Please enter building name and room number');
        setLoading(false);
        return;
      }
      deliveryAddress = {
        building: buildingName,
        room: roomNumber
      };
    } else {
      if (!customLocation.trim()) {
        setError('Please enter delivery location');
        setLoading(false);
        return;
      }
      deliveryAddress = {
        street: customLocation
      };
    }
    
    try {
      await api.orders.create({
        shop: shop._id,
        orderItems: items.map((i) => ({
          menuItem: i.menuItem._id,
          quantity: i.quantity
        })),
        paymentMethod,
        specialInstructions: notes || undefined,
        deliveryAddress
      });
      clear();
      navigate('/orders');
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        'Failed to place order. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-black text-white">Checkout</h1>
        <p className="mt-2 text-sm text-slate-300">
          Review your order and place it. Logged in as{' '}
          <b className="text-white">{user?.name ?? 'User'}</b>.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-5">
            <div className="text-base font-extrabold text-white">Delivery Location</div>
            <div className="mt-3 space-y-3">
              {/* Location Type Selection */}
              <div className="grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setDeliveryLocation('hostel')}
                  className={deliveryLocation === 'hostel' ? 'btn-primary' : 'btn-ghost'}
                >
                  🏨 Hostel
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryLocation('building')}
                  className={deliveryLocation === 'building' ? 'btn-primary' : 'btn-ghost'}
                >
                  🏢 Building
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryLocation('custom')}
                  className={deliveryLocation === 'custom' ? 'btn-primary' : 'btn-ghost'}
                >
                  📍 Custom
                </button>
              </div>

              {/* Location Specific Fields */}
              {deliveryLocation === 'hostel' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    className="input"
                    placeholder="Hostel Name (e.g., Boys Hostel A, Girls Hostel 5)"
                    value={hostelName}
                    onChange={(e) => setHostelName(e.target.value)}
                  />
                  <input
                    type="text"
                    className="input"
                    placeholder="Room Number (e.g., 201, A305)"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                  />
                </div>
              )}

              {deliveryLocation === 'building' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    className="input"
                    placeholder="Building Name (e.g., CSE Block, Admin Building)"
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                  />
                  <input
                    type="text"
                    className="input"
                    placeholder="Room/Desk Number"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                  />
                </div>
              )}

              {deliveryLocation === 'custom' && (
                <textarea
                  className="input resize-none"
                  placeholder="Enter detailed delivery location (e.g., Near library, sports complex, cafeteria)"
                  rows={3}
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="card p-5">
            <div className="text-base font-extrabold text-white">Payment</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {(['cash', 'card', 'campus_card', 'online'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={paymentMethod === m ? 'btn-primary w-full' : 'btn-ghost w-full'}
                >
                  {m.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="text-base font-extrabold text-white">Notes</div>
            <textarea
              className="input mt-3 min-h-24 resize-none"
              placeholder="Any special instructions? (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}
        </div>

        <div className="card p-5">
          <div className="text-lg font-black text-white">Order summary</div>
          <div className="mt-1 text-sm text-slate-400">{shop.name}</div>

          <div className="mt-4 space-y-2">
            {items.map((i) => (
              <div key={i.menuItem._id} className="flex items-center justify-between gap-3 text-sm">
                <div className="text-slate-200">
                  {i.menuItem.name} <span className="text-slate-500">×</span> {i.quantity}
                </div>
                <div className="font-bold text-white">
                  {formatMoney(i.menuItem.price * i.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <div className="text-sm text-slate-300">Subtotal</div>
            <div className="text-sm font-extrabold text-white">
              {formatMoney(subtotal)}
            </div>
          </div>

          <button
            className="btn-primary mt-4 w-full"
            type="button"
            onClick={placeOrder}
            disabled={loading}
          >
            {loading ? 'Placing…' : 'Place Order'}
          </button>
          <div className="mt-2 text-xs text-slate-400">
            Backend will compute delivery fee + tax and create the final order totals.
          </div>
        </div>
      </div>
    </div>
  );
}

