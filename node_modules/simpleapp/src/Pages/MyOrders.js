import React from 'react';
import { Package, XCircle, Star, Truck, CheckCircle, Clock, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SafeImage from '../Components/SafeImage';

const STEPS = [
  { key: 'Ordered',   icon: <Box size={14} />,         label: 'Order Placed'  },
  { key: 'Packed',    icon: <Package size={14} />,      label: 'Packed'        },
  { key: 'Shipped',   icon: <Truck size={14} />,        label: 'Shipped'       },
  { key: 'Delivered', icon: <CheckCircle size={14} />,  label: 'Delivered'     },
];

const getActiveIdx = (status) => {
  switch (status?.toLowerCase()) {
    case 'processing': return 1;
    case 'packed':     return 2;
    case 'shipped':    return 3;
    case 'delivered':  return 4;
    case 'cancelled':  return -1;
    default:           return 1;
  }
};

const getEstimatedDelivery = (orderDate, status) => {
  if (status === 'Delivered') return 'Delivered';
  if (status === 'Cancelled') return 'Cancelled';
  try {
    const placed = new Date(orderDate);
    if (isNaN(placed.getTime())) return 'Soon';
    const days = status === 'Shipped' ? 2 : status === 'Packed' ? 4 : 5;
    placed.setDate(placed.getDate() + days);
    return placed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return 'Soon'; }
};

const TrackingTimeline = ({ status }) => {
  const activeIdx = getActiveIdx(status);

  if (activeIdx === -1) {
    return (
      <div style={{ background: '#fff5f5', color: '#dc2626', padding: '10px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', border: '1px solid #fee2e2', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <XCircle size={14} /> Order Cancelled
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '480px' }}>
      {STEPS.map((step, idx) => {
        const done = activeIdx > idx;
        const current = activeIdx === idx + 1;
        return (
          <React.Fragment key={idx}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2, position: 'relative' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: done || current ? (done ? 'var(--success)' : 'var(--primary)') : 'var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: done || current ? '#fff' : 'var(--text-3)',
                boxShadow: current ? '0 0 0 4px rgba(61,90,241,0.2)' : 'none',
                transition: 'all 0.4s', flexShrink: 0
              }}>
                {step.icon}
              </div>
              <span style={{
                fontSize: '10px', fontWeight: '800',
                color: done || current ? 'var(--text-1)' : 'var(--text-3)',
                whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em'
              }}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: '3px',
                background: done ? 'var(--success)' : 'var(--border)',
                margin: '0 4px', marginBottom: '18px',
                transition: 'background 0.4s'
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    Processing: { bg: '#fef3c7', color: '#92400e', icon: <Clock size={12} /> },
    Packed:     { bg: '#ede9fe', color: '#5b21b6', icon: <Package size={12} /> },
    Shipped:    { bg: '#dbeafe', color: '#1e40af', icon: <Truck size={12} /> },
    Delivered:  { bg: '#d1fae5', color: '#065f46', icon: <CheckCircle size={12} /> },
    Cancelled:  { bg: '#fee2e2', color: '#991b1b', icon: <XCircle size={12} /> },
  };
  const c = config[status] || config.Processing;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '20px', background: c.bg, color: c.color, fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {c.icon} {status}
    </span>
  );
};

const MyOrders = ({ orders, cancelOrder, user, showToast }) => {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ padding: '40px 32px 80px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
          <h1 className="text-h1" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Package size={32} color="var(--primary)" /> My Orders
          </h1>
          <div style={{ fontSize: '14px', color: 'var(--text-3)', fontWeight: '700' }}>
            {orders?.length || 0} order{orders?.length !== 1 ? 's' : ''} placed
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders && orders.length > 0 ? (
            orders.map(order => {
              const estDelivery = getEstimatedDelivery(order.date, order.status);
              return (
                <div key={order._id} className="modern-card" style={{ padding: 0, overflow: 'hidden' }}>

                  {/* Order Header */}
                  <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Order Placed</div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-1)' }}>{order.date || 'N/A'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Total Amount</div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-1)' }}>₹{order?.total?.toLocaleString('en-IN') || '0'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Primary Item</div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {order?.items?.[0]?.name || 'Product'} {order?.items?.length > 1 ? `(+${order?.items?.length - 1})` : ''}
                        </div>
                      </div>
                      {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Est. Delivery</div>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--success)' }}>{estDelivery}</div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <StatusBadge status={order.status} />
                      <button className="btn-outline" style={{ padding: '7px 16px', fontSize: '12px' }}
                        onClick={() => showToast('Invoice download will be available soon!', 'info')}>
                        Invoice
                      </button>
                    </div>
                  </div>

                  {/* Tracking Bar */}
                  <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', background: 'var(--bg-page)' }}>
                    <TrackingTimeline status={order.status} />
                  </div>

                  {/* Order Items */}
                  <div style={{ padding: '24px 28px' }}>
                    {order?.items?.map((item, index) => (
                      <div key={`${item?.id}-${index}`} style={{
                        display: 'flex', gap: '24px', paddingBottom: index < order.items.length - 1 ? '24px' : '0',
                        marginBottom: index < order.items.length - 1 ? '24px' : '0',
                        borderBottom: index < order.items.length - 1 ? '1px dashed var(--border)' : 'none'
                      }}>
                        <div style={{ width: '90px', height: '90px', background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          onClick={() => navigate(`/product/${item?.id}`)}>
                          <SafeImage src={item?.image} alt={item?.name} productId={item?.id} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-1)', marginBottom: '6px', cursor: 'pointer', lineHeight: 1.3 }}
                            onClick={() => navigate(`/product/${item?.id}`)}>
                            {item?.name}
                          </div>
                          <div style={{ display: 'flex', gap: '16px', color: 'var(--text-3)', fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>
                            <span>Qty: {item.quantity}</span>
                            <span>Price: ₹{item?.price?.toLocaleString('en-IN')}</span>
                            <span style={{ fontWeight: '800', color: 'var(--text-2)' }}>Total: ₹{((item?.price || 0) * (item?.quantity || 1)).toLocaleString('en-IN')}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '16px' }}>
                            <button className="btn-outline"
                              style={{ border: 'none', color: 'var(--primary)', padding: 0, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', background: 'none' }}
                              onClick={() => navigate(`/product/${item.id}`)}>
                              <Star size={13} /> Rate & Review
                            </button>
                            <button className="btn-outline"
                              style={{ border: 'none', color: 'var(--primary)', padding: 0, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', background: 'none' }}
                              onClick={() => navigate(`/products?search=${encodeURIComponent((item.name || '').split(' ')[0])}`)}>
                              <Package size={13} /> Buy Again
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cancel Footer */}
                  {order.status === 'Processing' && (
                    <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', background: 'var(--bg-subtle)', gap: '12px' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-3)', alignSelf: 'center' }}>
                        ℹ️ You can cancel orders only while they're being processed.
                      </p>
                      <button onClick={() => cancelOrder(order._id)}
                        style={{ padding: '10px 22px', border: '1.5px solid #fca5a5', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: '800', fontSize: '13px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '7px', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fff5f5'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}>
                        <XCircle size={15} /> Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="modern-card" style={{ textAlign: 'center', padding: '100px 40px' }}>
              <div style={{ fontSize: '80px', marginBottom: '24px' }}>🧾</div>
              <h2 className="text-h1" style={{ marginBottom: '12px' }}>No orders yet</h2>
              <p style={{ color: 'var(--text-3)', fontSize: '16px', marginBottom: '36px' }}>
                You haven't placed any orders yet. Start shopping our premium collection!
              </p>
              <button className="btn-primary" style={{ padding: '16px 48px' }} onClick={() => navigate('/products')}>
                Start Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
