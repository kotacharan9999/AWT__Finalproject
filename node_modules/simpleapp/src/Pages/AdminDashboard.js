import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, CheckCircle, Clock, DollarSign, Trash2, Eye, Lock, Plus, Edit2, X, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getAdminHeaders } from '../utils/adminEncryption';
import SafeImage from '../Components/SafeImage';

const LIVE_REFRESH_MS = 15000;
const CATEGORIES = [
  'Electronics & Gadgets', 'Ladies Corner', 'Mens Corner', 'Grocery',
  'Home & Furniture', 'Home Appliances', 'Beauty & Personal Care', 'Lifestyle & Hobbies'
];

const EMPTY_PRODUCT = { name: '', brand: '', category: CATEGORIES[0], subcategory: '', price: '', rating: '4.0', description: '', stock: '100' };

const ProductFormModal = ({ product, onClose, onSave, showToast, user }) => {
  const [form, setForm] = useState(product || EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const isEdit = !!product?.id;

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `/api/products/${product.id}` : '/api/products';
      const res = await fetch(url, {
        method,
        headers: getAdminHeaders(user.token, true),
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const saved = await res.json();
        onSave(saved, isEdit);
        showToast(isEdit ? '✅ Product updated!' : '✅ Product added!', 'success');
        onClose();
      } else {
        const err = await res.json();
        showToast(err.message || 'Save failed', 'error');
      }
    } catch {
      showToast('Network error saving product', 'error');
    }
    setSaving(false);
  };

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', background: 'var(--bg-card)', color: 'var(--text-1)', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '24px' }}>
      <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--bg-subtle)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={18} />
        </button>
        <h2 style={{ fontWeight: '900', fontSize: '20px', marginBottom: '28px' }}>{isEdit ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={labelStyle}>Product Name *</label>
            <input required name="name" value={form.name} onChange={handle} style={inputStyle} placeholder="e.g. Samsung Galaxy S24" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Brand *</label>
              <input required name="brand" value={form.brand} onChange={handle} style={inputStyle} placeholder="e.g. Samsung" />
            </div>
            <div>
              <label style={labelStyle}>Price (₹) *</label>
              <input required type="number" min="1" name="price" value={form.price} onChange={handle} style={inputStyle} placeholder="e.g. 49999" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Category *</label>
              <select required name="category" value={form.category} onChange={handle} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Subcategory</label>
              <input name="subcategory" value={form.subcategory} onChange={handle} style={inputStyle} placeholder="e.g. Smartphones" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Rating (0–5)</label>
              <input type="number" step="0.1" min="0" max="5" name="rating" value={form.rating} onChange={handle} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Stock Quantity</label>
              <input type="number" min="0" name="stock" value={form.stock} onChange={handle} style={inputStyle} placeholder="100" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea name="description" value={form.description} onChange={handle} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Product description..." />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '12px 24px', border: '1px solid var(--border)', borderRadius: '8px', background: 'transparent', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: '12px 32px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '14px' }}>
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = ({ user, showToast }) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productPage, setProductPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [productModal, setProductModal] = useState(null); // null | 'add' | {product}
  const PRODUCTS_PER_PAGE = 12;

  useEffect(() => {
    if (user && !user.isAdmin) {
      showToast('❌ Access Denied: Admin privileges required', 'error');
      navigate('/');
    }
  }, [user, navigate, showToast]);

  const fetchOrders = useCallback((isBackgroundRefresh = false) => {
    if (!user?.isAdmin) return;
    if (isBackgroundRefresh) setIsRefreshing(true);
    else setLoading(true);
    fetch('/api/orders', { headers: getAdminHeaders(user?.token || '') })
      .then(res => res.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setLastUpdated(new Date());
        setLoading(false);
        setIsRefreshing(false);
      })
      .catch(err => {
        console.error(err);
        if (!isBackgroundRefresh) showToast('Failed to fetch orders', 'error');
        setLoading(false);
        setIsRefreshing(false);
      });
  }, [user?.isAdmin, user?.token, showToast]);

  const fetchProducts = useCallback(() => {
    fetch(`/api/products?limit=${PRODUCTS_PER_PAGE}&page=${productPage}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setTotalProducts(data.totalProducts || 0);
      })
      .catch(console.error);
  }, [productPage]);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchOrders();
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [user?.isAdmin, user?.token, fetchOrders, fetchProducts]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    const refreshOrders = () => { if (document.visibilityState === 'visible') fetchOrders(true); };
    const id = window.setInterval(refreshOrders, LIVE_REFRESH_MS);
    document.addEventListener('visibilitychange', refreshOrders);
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', refreshOrders); };
  }, [user?.isAdmin, fetchOrders]);

  useEffect(() => { if (activeTab === 'products') fetchProducts(); }, [activeTab, productPage, fetchProducts]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const resp = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: getAdminHeaders(user?.token || '', true),
        body: JSON.stringify({ status: newStatus })
      });
      if (resp.ok) { showToast(`✅ Order ${newStatus.toLowerCase()}!`, 'success'); fetchOrders(); }
      else if (resp.status === 403) showToast('🔒 Access Denied', 'error');
      else showToast('Failed to update status', 'error');
    } catch { showToast('Server error', 'error'); }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('⚠️ Permanently delete this order? This cannot be undone.')) return;
    try {
      const resp = await fetch(`/api/orders/${id}`, { method: 'DELETE', headers: getAdminHeaders(user?.token || '', true) });
      if (resp.ok) { showToast('🗑️ Order deleted securely', 'success'); fetchOrders(); }
      else if (resp.status === 403) showToast('🔒 Access Denied', 'error');
    } catch { showToast('Failed to delete order', 'error'); }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('⚠️ Permanently delete this product?')) return;
    try {
      const resp = await fetch(`/api/products/${productId}`, { method: 'DELETE', headers: getAdminHeaders(user?.token || '', true) });
      if (resp.ok) { showToast('🗑️ Product deleted!', 'success'); fetchProducts(); }
      else showToast('Failed to delete product', 'error');
    } catch { showToast('Error deleting product', 'error'); }
  };

  const handleProductSaved = (saved, isEdit) => {
    if (isEdit) setProducts(ps => ps.map(p => p.id === saved.id ? saved : p));
    else fetchProducts();
  };

  const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status?.toLowerCase() === filter.toLowerCase());

  const stats = {
    total: orders.length,
    processing: orders.filter(o => o.status === 'Processing').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    revenue: orders.reduce((sum, o) => sum + (o?.total || 0), 0),
  };

  const dailyRevenue = {};
  orders.forEach(o => {
    const day = new Date(o?.date || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dailyRevenue[day] = (dailyRevenue[day] || 0) + (o?.total || 0);
  });
  const chartData = Object.entries(dailyRevenue).map(([name, revenue]) => ({ name, revenue })).reverse();

  const totalProductPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  if (!user?.isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '20px' }}>
        <Lock size={64} color="#f44336" />
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Access Denied</h1>
        <p style={{ color: 'var(--text-2)' }}>This dashboard is only accessible to administrators.</p>
      </div>
    );
  }

  if (loading) return <div className="container" style={{ margin: '40px auto', textAlign: 'center' }}><h2>Loading Dashboard...</h2></div>;

  return (
    <div className="container" style={{ margin: '40px auto', padding: '0 24px', marginBottom: '80px' }}>

      {/* Product Form Modal */}
      {productModal && (
        <ProductFormModal
          product={productModal === 'add' ? null : productModal}
          onClose={() => setProductModal(null)}
          onSave={handleProductSaved}
          showToast={showToast}
          user={user}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="text-h1">🔐 Owner Dashboard</h1>
          <p style={{ color: 'var(--text-2)', marginTop: '8px' }}>Welcome back, {user?.name || 'Admin'} • Manage your marketplace</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: '700' }}>
            {lastUpdated ? `Last sync: ${lastUpdated.toLocaleTimeString('en-IN')}` : 'Syncing...'}
            {isRefreshing ? ' • refreshing…' : ''}
          </div>
          <button className="btn-outline" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => fetchOrders(true)}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '32px', borderBottom: '2px solid var(--border)' }}>
        {['orders', 'products', 'analytics'].map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setShowOrderDetails(false); }}
            style={{ padding: '12px 24px', borderBottom: activeTab === tab ? '3px solid var(--primary)' : 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: activeTab === tab ? '800' : '600', color: activeTab === tab ? 'var(--primary)' : 'var(--text-2)', textTransform: 'capitalize', transition: '0.2s' }}>
            {tab === 'orders' ? `📋 Orders (${orders.length})` : tab === 'products' ? `🛍️ Products (${totalProducts})` : '📊 Analytics'}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      {(activeTab === 'orders' || activeTab === 'analytics') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {[
            { label: 'Total Orders', value: stats.total, color: 'var(--primary)', icon: <Package size={24} color="var(--primary)" /> },
            { label: 'Processing', value: stats.processing, color: 'var(--accent)', icon: <Clock size={24} color="var(--accent)" /> },
            { label: 'Delivered', value: stats.delivered, color: '#3498db', icon: <CheckCircle size={24} color="#3498db" /> },
            { label: 'Total Revenue', value: `₹${(stats.revenue / 100000).toFixed(1)}L`, color: 'var(--success)', icon: <DollarSign size={24} color="var(--success)" /> },
          ].map(s => (
            <div key={s.label} className="modern-card" style={{ padding: '24px', borderLeft: `4px solid ${s.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="text-overline" style={{ color: 'var(--text-3)', marginBottom: '8px' }}>{s.label}</div>
                  <h3 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-1)' }}>{s.value}</h3>
                </div>
                {s.icon}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div>
          <div className="modern-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <h2 className="text-h2">Orders Management</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['All', 'Processing', 'Packed', 'Shipped', 'Delivered'].map(f => (
                  <button key={f} className={filter === f ? 'btn-primary' : 'btn-outline'}
                    style={{ padding: '7px 14px', fontSize: '12px', borderRadius: '999px' }} onClick={() => setFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    {['Order Item', 'Customer', 'Items', 'Amount', 'Date', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '14px 18px', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-3)', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>No orders found</td></tr>
                  ) : filteredOrders.map(order => (
                    <tr key={order?._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '14px 18px', fontWeight: '700', color: 'var(--primary)', fontSize: '13px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order?.items?.[0]?.name || 'Unknown Item'} {order?.items?.length > 1 ? `(+${order?.items?.length - 1})` : ''}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px' }}>{order?.userEmail}</td>
                      <td style={{ padding: '14px 18px', fontSize: '13px' }}>{order.items?.length || 0} items</td>
                      <td style={{ padding: '14px 18px', fontWeight: '800', fontSize: '14px' }}>₹{order?.total?.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '14px 18px', fontSize: '12px', color: 'var(--text-3)' }}>{order?.date || 'N/A'}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          padding: '5px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                          background: order.status === 'Delivered' ? '#d1fae5' : order.status === 'Shipped' ? '#dbeafe' : order.status === 'Packed' ? '#ede9fe' : order.status === 'Cancelled' ? '#fee2e2' : '#fef3c7',
                          color: order.status === 'Delivered' ? '#065f46' : order.status === 'Shipped' ? '#1e40af' : order.status === 'Packed' ? '#5b21b6' : order.status === 'Cancelled' ? '#991b1b' : '#92400e'
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button onClick={() => { setSelectedOrder(order); setShowOrderDetails(true); }}
                            style={{ padding: '6px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }} title="View">
                            <Eye size={14} />
                          </button>
                          <select style={{ padding: '5px 6px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-1)', cursor: 'pointer', fontSize: '12px' }}
                            value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)}>
                            <option>Processing</option>
                            <option>Packed</option>
                            <option>Shipped</option>
                            <option>Delivered</option>
                          </select>
                          <button onClick={() => handleDeleteOrder(order._id)}
                            style={{ padding: '6px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Detail Modal */}
          {showOrderDetails && selectedOrder && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div className="modern-card" style={{ width: '90%', maxWidth: '520px', maxHeight: '80vh', overflow: 'auto', padding: '32px', position: 'relative' }}>
                <button onClick={() => setShowOrderDetails(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--bg-subtle)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
                <h2 className="text-h2" style={{ marginBottom: '24px' }}>Order Details: {selectedOrder?.items?.[0]?.name || 'Unknown'}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { label: 'Customer', value: selectedOrder.userEmail },
                    { label: 'Date', value: selectedOrder.date },
                    { label: 'Total', value: `₹${selectedOrder.total?.toLocaleString('en-IN')}` },
                    { label: 'Status', value: selectedOrder.status },
                  ].map(r => (
                    <div key={r.label} style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>{r.label}</div>
                      <div style={{ fontSize: '15px', fontWeight: '700' }}>{r.value}</div>
                    </div>
                  ))}
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px' }}>Items</div>
                    {selectedOrder.items?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '8px 0', borderBottom: '1px dashed var(--border)' }}>
                        <span>{item.quantity}× {item.name}</span>
                        <span style={{ fontWeight: '700' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 className="text-h2">Product Catalog ({totalProducts} total)</h2>
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setProductModal('add')}>
              <Plus size={16} /> Add New Product
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {products.map(p => (
              <div key={p.id} className="modern-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '160px', background: '#f8f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative' }}>
                  <SafeImage src={p.image} alt={p.name} productId={p.id} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase' }}>{p.brand}</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-1)', marginBottom: '6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4, minHeight: '36px' }}>{p.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: '900', fontSize: '15px' }}>₹{p.price?.toLocaleString('en-IN')}</span>
                    <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '700' }}>⭐ {p.rating}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                    <button onClick={() => setProductModal(p)} style={{ flex: 1, padding: '7px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => handleDeleteProduct(p.id)} style={{ flex: 1, padding: '7px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalProductPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
              <button className="btn-outline" disabled={productPage === 1} onClick={() => setProductPage(p => p - 1)} style={{ padding: '8px 18px' }}>← Prev</button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '700', color: 'var(--text-2)', padding: '0 12px' }}>Page {productPage} of {totalProductPages}</span>
              <button className="btn-outline" disabled={productPage === totalProductPages} onClick={() => setProductPage(p => p + 1)} style={{ padding: '8px 18px' }}>Next →</button>
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div>
          <div className="modern-card" style={{ padding: '32px', marginBottom: '32px' }}>
            <h2 className="text-h2" style={{ marginBottom: '24px' }}>📊 Revenue Analytics</h2>
            {chartData.length > 0 ? (
              <div style={{ width: '100%', height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--text-3)" tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-3)" tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}K`} />
                    <Tooltip cursor={{ fill: 'var(--bg-subtle)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-3)' }}>No revenue data yet. Orders will appear here.</div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { label: 'Avg Order Value', value: orders.length > 0 ? `₹${(stats.revenue / orders.length).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '₹0', color: 'var(--primary)' },
              { label: 'Delivery Rate', value: orders.length > 0 ? `${((stats.delivered / orders.length) * 100).toFixed(1)}%` : '0%', color: 'var(--success)' },
              { label: 'Pending Orders', value: stats.processing, color: 'var(--accent)' },
              { label: 'Shipped Orders', value: stats.shipped, color: '#3498db' },
            ].map(s => (
              <div key={s.label} className="modern-card" style={{ padding: '24px' }}>
                <div className="text-overline" style={{ color: 'var(--text-3)', marginBottom: '12px' }}>{s.label}</div>
                <div style={{ fontSize: '28px', fontWeight: '900', color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
