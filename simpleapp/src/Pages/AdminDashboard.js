import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const AdminDashboard = ({ user, showToast }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchOrders = () => {
    fetch('http://localhost:5000/api/orders', {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        showToast('Failed to fetch orders', 'error');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const resp = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (resp.ok) {
        showToast('Order status updated', 'success');
        fetchOrders();
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server error', 'error');
    }
  };

  const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status.toLowerCase() === filter.toLowerCase());

  const stats = {
    total: orders.length,
    processing: orders.filter(o => o.status === 'Processing').length,
    packed: orders.filter(o => o.status === 'Packed').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
  };

  // Compute Daily Revenue Chart Data
  const dailyRevenue = {};
  orders.forEach(o => {
      // Default to today if date missing, else map to readable short month string
      const day = new Date(o.date || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dailyRevenue[day]) dailyRevenue[day] = 0;
      dailyRevenue[day] += o.total;
  });
  // Sort temporally or rely on DB order (sorted by recent). We will just map it.
  const chartData = Object.keys(dailyRevenue).map(key => ({ name: key, revenue: dailyRevenue[key] })).reverse();

  if (loading) {
    return <div className="container" style={{ margin: '40px auto', textAlign: 'center' }}><h2>Loading Dashboard...</h2></div>;
  }

  return (
    <div className="container" style={{ margin: '40px auto', padding: '0 24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="text-h1">Owner Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user.name} • Manage all your orders efficiently.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        
        <div className="modern-card hover-card" style={{ padding: '24px', borderLeft: '4px solid var(--primary-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="text-overline" style={{ color: 'var(--text-secondary)' }}>Total Orders</p>
              <h3 style={{ fontSize: '32px', fontWeight: '700', marginTop: '8px' }}>{stats.total}</h3>
            </div>
            <Package size={24} color="var(--primary-color)" />
          </div>
        </div>

        <div className="modern-card hover-card" style={{ padding: '24px', borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="text-overline" style={{ color: 'var(--text-secondary)' }}>Processing</p>
              <h3 style={{ fontSize: '32px', fontWeight: '700', marginTop: '8px' }}>{stats.processing}</h3>
            </div>
            <Clock size={24} color="var(--warning)" />
          </div>
        </div>

        <div className="modern-card hover-card" style={{ padding: '24px', borderLeft: '4px solid #3498db' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="text-overline" style={{ color: 'var(--text-secondary)' }}>Packed & Shipped</p>
              <h3 style={{ fontSize: '32px', fontWeight: '700', marginTop: '8px' }}>{stats.packed + stats.shipped}</h3>
            </div>
            <Truck size={24} color="#3498db" />
          </div>
        </div>

        <div className="modern-card hover-card" style={{ padding: '24px', borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="text-overline" style={{ color: 'var(--text-secondary)' }}>Delivered</p>
              <h3 style={{ fontSize: '32px', fontWeight: '700', marginTop: '8px' }}>{stats.delivered}</h3>
            </div>
            <CheckCircle size={24} color="var(--success)" />
          </div>
        </div>

      </div>

      {/* Analytics Chart */}
      <div className="modern-card hover-card" style={{ padding: '24px', marginBottom: '40px' }}>
        <h2 className="text-h2" style={{ marginBottom: '24px' }}>Revenue Analytics</h2>
        <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-secondary)" tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip cursor={{fill: 'var(--bg-secondary)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-primary)' }} />
                    <Bar dataKey="revenue" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="modern-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <h2 className="text-h2">Recent Orders</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['All', 'Processing', 'Packed', 'Shipped', 'Delivered'].map(f => (
              <button 
                key={f}
                className={filter === f ? "btn-gradient" : "btn-outline"}
                style={{ padding: '6px 16px', fontSize: '13px', borderRadius: 'var(--radius-pill)' }}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '16px 24px', fontWeight: '500', fontSize: '14px' }}>Order ID</th>
                <th style={{ padding: '16px 24px', fontWeight: '500', fontSize: '14px' }}>Customer</th>
                <th style={{ padding: '16px 24px', fontWeight: '500', fontSize: '14px' }}>Date</th>
                <th style={{ padding: '16px 24px', fontWeight: '500', fontSize: '14px' }}>Items</th>
                <th style={{ padding: '16px 24px', fontWeight: '500', fontSize: '14px' }}>Total</th>
                <th style={{ padding: '16px 24px', fontWeight: '500', fontSize: '14px' }}>Status</th>
                <th style={{ padding: '16px 24px', fontWeight: '500', fontSize: '14px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No orders found for this filter.</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order._id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--primary-color)' }}>...{order._id.slice(-6)}</td>
                    <td style={{ padding: '16px 24px' }}>{order.userEmail}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{order.date}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} style={{ fontSize: '13px' }}>{item.quantity}x {item.name.slice(0, 20)}...</div>
                        ))}
                        {order.items.length > 2 && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>+ {order.items.length - 2} more</div>}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: '600' }}>₹{order.total.toFixed(2)}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        padding: '4px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: '600',
                        backgroundColor: order.status === 'Delivered' ? 'rgba(46, 204, 113, 0.1)' : 
                                         order.status === 'Shipped' ? 'rgba(52, 152, 219, 0.1)' : 
                                         order.status === 'Packed' ? 'rgba(155, 89, 182, 0.1)' : 
                                         'rgba(243, 156, 18, 0.1)',
                        color: order.status === 'Delivered' ? 'var(--success)' : 
                               order.status === 'Shipped' ? '#3498db' : 
                               order.status === 'Packed' ? '#9b59b6' : 
                               'var(--warning)'
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <select 
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer' }}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default AdminDashboard;
