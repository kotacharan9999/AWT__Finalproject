import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, Power, Package, Heart, Edit2, Plus, Trash2, MapPin, ChevronRight, Folder } from 'lucide-react';

const TrackingTimeline = ({ status }) => {
  const steps = ['Ordered', 'Packed', 'Shipped', 'Delivered'];
  const getActiveIndex = () => {
    switch(status?.toLowerCase()) {
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };
  const activeIdx = getActiveIndex();

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '350px', margin: '16px 0 24px 0' }}>
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2 }}>
            <div style={{ 
              width: '14px', height: '14px', borderRadius: '50%', 
              backgroundColor: activeIdx >= idx ? '#26a541' : '#e0e0e0', 
              boxShadow: '0 0 0 3px #fff, 0 0 0 5px ' + (activeIdx >= idx ? '#26a541' : '#e0e0e0'),
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }} />
            <span style={{ fontSize: '11px', fontWeight: '600', color: activeIdx >= idx ? 'var(--text-primary)' : 'var(--text-tertiary)', whiteSpace: 'nowrap', marginTop: '4px' }}>{step}</span>
          </div>
          {idx < steps.length - 1 && (
            <div style={{ flex: 1, height: '3px', backgroundColor: activeIdx > idx ? '#26a541' : '#e0e0e0', margin: '0 -4px', zIndex: 1, marginTop: '-20px' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const Account = ({ user, setUser, orders, showToast, addresses, setAddresses }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders'); // 'profile' | 'addresses' | 'orders'
  
  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || ''
  });

  // Address Add State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: '', street: '', city: '', postalCode: '', phone: ''
  });

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const handleComingSoon = () => showToast('Feature coming soon!', 'info');

  const handleProfileSave = () => {
    if (!profileForm.firstName.trim() || !profileForm.email.trim()) {
      showToast('First Name and Email are required.', 'error');
      return;
    }
    setUser({ ...user, name: `${profileForm.firstName} ${profileForm.lastName}`.trim(), email: profileForm.email });
    setIsEditingProfile(false);
    showToast('Profile updated successfully!', 'success');
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(`http://localhost:5000/api/users/${user.email}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(addressForm)
      });
      const newAddresses = await resp.json();
      setAddresses(newAddresses);
      setIsAddingAddress(false);
      setAddressForm({ name: '', street: '', city: '', postalCode: '', phone: '' });
      showToast('Address encrypted and saved securely!', 'success');
    } catch(err) {
      showToast('Error saving address', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const resp = await fetch(`http://localhost:5000/api/users/${user.email}/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const newAddresses = await resp.json();
      setAddresses(newAddresses);
      showToast('Address removed.', 'info');
    } catch(err) {
      showToast('Error removing address', 'error');
    }
  };

  return (
    <div className="container modern-split-layout" style={{ margin: '40px auto', padding: '0 24px' }}>
      
      {/* Sidebar Account Navigation - Flipkart Style Dense Layout */}
      <aside>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Hello User Strip */}
          <div className="modern-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
             <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff`} alt="Avatar" style={{ borderRadius: '50%', width: '50px', height: '50px' }} />
             <div>
               <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Hello,</div>
               <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{user.name}</div>
             </div>
          </div>

          <div className="modern-card" style={{ padding: '0', borderRadius: '4px', overflow: 'hidden' }}>
             <div 
                onClick={() => setActiveTab('orders')}
                style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: activeTab === 'orders' ? 'rgba(0,0,0,0.02)' : 'transparent' }}>
               <div style={{ display: 'flex', gap: '16px', color: activeTab === 'orders' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: '600', fontSize: '15px', alignItems: 'center' }}>
                  <Package size={20} color="var(--primary-color)" /> MY ORDERS
               </div>
               <ChevronRight size={16} color="var(--text-tertiary)" />
             </div>
             
             {/* Settings Group */}
             <div style={{ borderBottom: '1px solid var(--border-light)' }}>
               <div style={{ padding: '16px 20px', display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '15px', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
                  <User size={20} color="var(--primary-color)" /> ACCOUNT SETTINGS
               </div>
               <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  <li onClick={() => setActiveTab('profile')} style={{ padding: '12px 20px 12px 56px', fontSize: '14px', cursor: 'pointer', background: activeTab === 'profile' ? 'rgba(0,0,0,0.03)' : 'transparent', color: activeTab === 'profile' ? 'var(--primary-color)' : 'var(--text-primary)', fontWeight: activeTab === 'profile' ? '600' : '500' }}>
                    Profile Information
                  </li>
                  <li onClick={() => setActiveTab('addresses')} style={{ padding: '12px 20px 12px 56px', fontSize: '14px', cursor: 'pointer', background: activeTab === 'addresses' ? 'rgba(0,0,0,0.03)' : 'transparent', color: activeTab === 'addresses' ? 'var(--primary-color)' : 'var(--text-primary)', fontWeight: activeTab === 'addresses' ? '600' : '500' }}>
                    Manage Addresses
                  </li>
                  <li onClick={handleComingSoon} style={{ padding: '12px 20px 12px 56px', fontSize: '14px', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: '500' }}>
                    PAN Card Information
                  </li>
               </ul>
             </div>
             
             {/* Payments Group */}
             <div style={{ borderBottom: '1px solid var(--border-light)' }}>
               <div style={{ padding: '16px 20px', display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '15px', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
                  <CreditCard size={20} color="var(--primary-color)" /> PAYMENTS
               </div>
               <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  <li onClick={handleComingSoon} style={{ padding: '12px 20px 12px 56px', fontSize: '14px', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: '500', display: 'flex', justifyContent: 'space-between' }}>
                    Gift Cards <span style={{ color: '#26a541', fontWeight: '700' }}>₹0</span>
                  </li>
                  <li onClick={handleComingSoon} style={{ padding: '12px 20px 12px 56px', fontSize: '14px', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: '500' }}>
                    Saved UPI
                  </li>
                  <li onClick={handleComingSoon} style={{ padding: '12px 20px 12px 56px', fontSize: '14px', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: '500' }}>
                    Saved Cards
                  </li>
               </ul>
             </div>
             
             {/* My Stuff Group */}
             <div style={{ borderBottom: '1px solid var(--border-light)' }}>
               <div style={{ padding: '16px 20px', display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '15px', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
                  <Folder size={20} color="var(--primary-color)" /> MY STUFF
               </div>
               <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  <li onClick={handleComingSoon} style={{ padding: '12px 20px 12px 56px', fontSize: '14px', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: '500' }}>
                    My Coupons
                  </li>
                  <li onClick={handleComingSoon} style={{ padding: '12px 20px 12px 56px', fontSize: '14px', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: '500' }}>
                    My Reviews & Ratings
                  </li>
                  <li onClick={handleComingSoon} style={{ padding: '12px 20px 12px 56px', fontSize: '14px', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: '500' }}>
                    All Notifications
                  </li>
                  <li onClick={() => navigate('/wishlist')} style={{ padding: '12px 20px 12px 56px', fontSize: '14px', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: '500' }}>
                    My Wishlist
                  </li>
               </ul>
             </div>
             
             <div style={{ padding: '20px 24px', display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '15px', alignItems: 'center', cursor: 'pointer', borderTop: '1px solid var(--border-light)' }} onClick={handleLogout}>
               <Power size={20} color="var(--text-tertiary)" /> Logout
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="modern-card animate-entrance" style={{ padding: '32px', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Personal Information</h2>
              {!isEditingProfile ? (
                 <button style={{ color: 'var(--primary-color)', fontWeight: '600', background: 'transparent', cursor: 'pointer' }} onClick={() => setIsEditingProfile(true)}>
                   Edit
                 </button>
              ) : (
                 <div style={{ display: 'flex', gap: '16px' }}>
                   <button style={{ color: 'var(--text-secondary)', fontWeight: '600', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setIsEditingProfile(false)}>Cancel</button>
                   <button className="btn-gradient" style={{ padding: '8px 24px', borderRadius: '4px', fontSize: '14px' }} onClick={handleProfileSave}>SAVE</button>
                 </div>
              )}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '600px' }}>
               <div>
                  <input type="text" className="modern-input" style={{ borderRadius: '4px', backgroundColor: isEditingProfile ? '#fff' : '#f5f5f5' }} value={isEditingProfile ? profileForm.firstName : user.name.split(' ')[0]} onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})} disabled={!isEditingProfile} placeholder="First Name" />
               </div>
               <div>
                  <input type="text" className="modern-input" style={{ borderRadius: '4px', backgroundColor: isEditingProfile ? '#fff' : '#f5f5f5' }} value={isEditingProfile ? profileForm.lastName : (user.name.split(' ').slice(1).join(' ') || '')} onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})} disabled={!isEditingProfile} placeholder="Last Name" />
               </div>
               
               <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>Email Address</h3>
                  <input type="email" className="modern-input" style={{ borderRadius: '4px', backgroundColor: isEditingProfile ? '#fff' : '#f5f5f5' }} value={isEditingProfile ? profileForm.email : user.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} disabled={!isEditingProfile} placeholder="Email" />
               </div>
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="modern-card animate-entrance" style={{ borderRadius: '4px', padding: '0' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Manage Addresses</h2>
            </div>
            
            <div style={{ padding: '24px' }}>
              {!isAddingAddress && (
                <div 
                  style={{ border: '1px solid var(--border-light)', borderRadius: '4px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--primary-color)', fontWeight: '600', cursor: 'pointer', marginBottom: '24px' }}
                  onClick={() => setIsAddingAddress(true)}
                >
                  <Plus size={20} /> ADD A NEW ADDRESS
                </div>
              )}

              {isAddingAddress && (
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '4px', marginBottom: '24px', border: '1px solid var(--border-light)' }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--primary-color)', fontWeight: '600', marginBottom: '24px' }}>ADD A NEW ADDRESS</h3>
                  <form onSubmit={handleAddAddress} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <input required type="text" placeholder="Name" className="modern-input" style={{ borderRadius: '4px' }} value={addressForm.name} onChange={(e) => setAddressForm({...addressForm, name: e.target.value})} />
                    </div>
                    <div>
                      <input required type="text" placeholder="City / District" className="modern-input" style={{ borderRadius: '4px' }} value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} />
                    </div>
                    <div>
                      <input required type="text" placeholder="Pincode" className="modern-input" style={{ borderRadius: '4px' }} value={addressForm.postalCode} onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <textarea required placeholder="Address (Area and Street)" className="modern-input" style={{ borderRadius: '4px', resize: 'vertical', minHeight: '80px' }} value={addressForm.street} onChange={(e) => setAddressForm({...addressForm, street: e.target.value})} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <input required type="tel" placeholder="10-digit mobile number" className="modern-input" style={{ borderRadius: '4px' }} value={addressForm.phone} onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})} />
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '16px', marginTop: '16px' }}>
                      <button type="submit" className="btn-gradient" style={{ borderRadius: '4px', padding: '12px 32px' }}>SAVE</button>
                      <button type="button" style={{ background: 'transparent', border: 'none', fontWeight: '600', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setIsAddingAddress(false)}>CANCEL</button>
                    </div>
                  </form>
                </div>
              )}

              {addresses.map(addr => (
                <div key={addr._id || addr.id} style={{ border: '1px solid var(--border-light)', borderRadius: '4px', padding: '24px', position: 'relative', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{addr.name}</div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{addr.phone}</div>
                    </div>
                    <button 
                      onClick={() => handleDeleteAddress(addr._id || addr.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                      title="Delete Address"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {addr.street}, {addr.city} - <span style={{ fontWeight: '600' }}>{addr.postalCode}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="animate-entrance" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             {orders && orders.length > 0 ? (
               orders.map(order => (
                 order.items.map((item, index) => (
                   <div key={item.id + index} className="modern-card" style={{ borderRadius: '4px', padding: '0', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'box-shadow 0.2s' }} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
                     <div style={{ display: 'flex', padding: '24px', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
                       
                       {/* Product Image */}
                       <div style={{ width: '80px', height: '80px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                       </div>
                       
                       {/* Context */}
                       <div style={{ flex: 2, minWidth: '200px' }}>
                         <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: '1.4' }}>{item.name}</div>
                         <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Seller: PremiumRetail</div>
                         <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>₹{item.price.toFixed(2)}</div>
                       </div>
                       
                       {/* Timeline Tracker */}
                       <div style={{ flex: 3, minWidth: '300px', display: 'flex', flexDirection: 'column', paddingLeft: '16px' }}>
                         <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                           Delivery Expected By {new Date(new Date(order.date).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                         </div>
                         <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                           Your item is currently {order.status.toLowerCase()}
                         </div>
                         <TrackingTimeline status={order.status} />
                       </div>
                       
                     </div>
                   </div>
                 ))
               ))
             ) : (
               <div className="modern-card" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <div style={{ width: '200px', height: '150px', marginBottom: '24px', backgroundColor: 'var(--bg-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '4px' }}>
                   <div style={{ fontSize: '64px' }}>📦</div>
                 </div>
                 <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No Orders Found</div>
                 <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Looks like you haven't made a purchase yet.</div>
                 <button className="btn-gradient" style={{ padding: '12px 32px', borderRadius: '4px', fontWeight: '600' }} onClick={() => navigate('/products')}>Browse Catalogue</button>
               </div>
             )}
          </div>
        )}

      </main>
    </div>
  );
};

export default Account;
