import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Power, Package, Plus, Trash2, MapPin, ChevronRight, Folder, Wallet, Bell, MessageSquare } from 'lucide-react';

const Account = ({ user, setUser, orders, showToast, addresses, setAddresses }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders'); // 'profile' | 'addresses' | 'orders'
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || ''
  });

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: '', street: '', city: '', postalCode: '', phone: ''
  });

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const handleComingSoon = () => showToast('Feature available in next update!', 'info');

  const handleProfileSave = () => {
    if (!profileForm.firstName.trim() || !profileForm.email.trim()) {
      showToast('Name and Email are required.', 'error');
      return;
    }
    setUser({ ...user, name: `${profileForm.firstName} ${profileForm.lastName}`.trim(), email: profileForm.email });
    setIsEditingProfile(false);
    showToast('Profile updated!', 'success');
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(`/api/users/${user.email}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(addressForm)
      });
      const newAddresses = await resp.json();
      if (Array.isArray(newAddresses)) setAddresses(newAddresses);
      else setAddresses([]);
      setIsAddingAddress(false);
      setAddressForm({ name: '', street: '', city: '', postalCode: '', phone: '' });
      showToast('Address saved safely!', 'success');
    } catch(err) {
      showToast('Error saving address', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const resp = await fetch(`/api/users/${user.email}/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const newAddresses = await resp.json();
      if (Array.isArray(newAddresses)) setAddresses(newAddresses);
      else setAddresses([]);
      showToast('Address removed.', 'info');
    } catch(err) {
      showToast('Error removing address', 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 32px 80px', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ width: '320px', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* User Header */}
          <div className="modern-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--bg-card)' }}>
             <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '20px' }}>
                {user?.name?.[0] || 'U'}
             </div>
             <div>
               <div style={{ fontSize: '12px', color: 'var(--text-3)', fontWeight: '700', textTransform: 'uppercase' }}>Hello,</div>
               <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-1)' }}>{user?.name || 'User'}</div>
             </div>
          </div>

          <div className="modern-card" style={{ padding: '0', overflow: 'hidden' }}>
             <div 
                onClick={() => navigate('/orders')}
                style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: '0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
               <div style={{ display: 'flex', gap: '16px', color: 'var(--text-2)', fontWeight: '800', fontSize: '14px', alignItems: 'center' }}>
                  <Package size={22} color="var(--primary)" /> MY ORDERS
               </div>
               <ChevronRight size={18} color="var(--text-3)" />
             </div>
             
             {/* Settings */}
             <div style={{ borderBottom: '1px solid var(--border)' }}>
               <div style={{ padding: '20px 24px', display: 'flex', gap: '16px', color: 'var(--text-2)', fontWeight: '800', fontSize: '14px', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                  <User size={22} color="var(--primary)" /> ACCOUNT SETTINGS
               </div>
               <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
                  <li onClick={() => setActiveTab('profile')} style={{ padding: '12px 24px 12px 62px', fontSize: '14px', cursor: 'pointer', background: activeTab === 'profile' ? 'var(--bg-subtle)' : 'transparent', color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-1)', fontWeight: activeTab === 'profile' ? '800' : '600', transition: '0.2s' }}>
                    Profile Information
                  </li>
                  <li onClick={() => setActiveTab('addresses')} style={{ padding: '12px 24px 12px 62px', fontSize: '14px', cursor: 'pointer', background: activeTab === 'addresses' ? 'var(--bg-subtle)' : 'transparent', color: activeTab === 'addresses' ? 'var(--primary)' : 'var(--text-1)', fontWeight: activeTab === 'addresses' ? '800' : '600', transition: '0.2s' }}>
                    Manage Addresses
                  </li>
               </ul>
             </div>
             
             {/* Payments */}
             <div style={{ borderBottom: '1px solid var(--border)' }}>
               <div style={{ padding: '20px 24px', display: 'flex', gap: '16px', color: 'var(--text-2)', fontWeight: '800', fontSize: '14px', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                  <Wallet size={22} color="var(--primary)" /> PAYMENTS
               </div>
               <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
                  <li onClick={handleComingSoon} style={{ padding: '12px 24px 12px 62px', fontSize: '14px', cursor: 'pointer', color: 'var(--text-2)', fontWeight: '600' }}>
                    Saved Cards
                  </li>
                  <li onClick={handleComingSoon} style={{ padding: '12px 24px 12px 62px', fontSize: '14px', cursor: 'pointer', color: 'var(--text-2)', fontWeight: '600' }}>
                    UPI Settings
                  </li>
               </ul>
             </div>
             
             {/* My Stuff */}
             <div style={{ borderBottom: '1px solid var(--border)' }}>
               <div style={{ padding: '20px 24px', display: 'flex', gap: '16px', color: 'var(--text-2)', fontWeight: '800', fontSize: '14px', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                  <Folder size={22} color="var(--primary)" /> MY STUFF
               </div>
               <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
                  <li onClick={() => navigate('/wishlist')} style={{ padding: '12px 24px 12px 62px', fontSize: '14px', cursor: 'pointer', color: 'var(--text-1)', fontWeight: '600' }}>
                    My Wishlist
                  </li>
                  <li onClick={handleComingSoon} style={{ padding: '12px 24px 12px 62px', fontSize: '14px', cursor: 'pointer', color: 'var(--text-2)', fontWeight: '600' }}>
                    My Reviews
                  </li>
               </ul>
             </div>
             
             <div style={{ padding: '24px', display: 'flex', gap: '16px', color: 'var(--text-3)', fontWeight: '800', fontSize: '14px', alignItems: 'center', cursor: 'pointer', borderTop: '1px solid var(--border)' }} onClick={handleLogout}>
                <Power size={22} color="var(--text-3)" /> LOGOUT FROM ACCOUNT
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="modern-card free-padding">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <h2 className="text-h2">Personal Information</h2>
              {!isEditingProfile ? (
                 <button className="btn-outline" style={{ padding: '8px 24px' }} onClick={() => setIsEditingProfile(true)}>
                    EDIT
                 </button>
              ) : (
                 <div style={{ display: 'flex', gap: '16px' }}>
                   <button style={{ color: 'var(--text-3)', fontWeight: '800', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px' }} onClick={() => setIsEditingProfile(false)}>CANCEL</button>
                   <button className="btn-primary" style={{ padding: '8px 32px' }} onClick={handleProfileSave}>SAVE CHANGES</button>
                 </div>
              )}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', maxWidth: '800px' }}>
               <div>
                  <label className="text-overline" style={{ display: 'block', marginBottom: '8px' }}>First Name</label>
                  <input type="text" className="modern-input" style={{ backgroundColor: isEditingProfile ? '#fff' : 'var(--bg-subtle)' }} value={isEditingProfile ? profileForm.firstName : (user?.name?.split(' ')[0] || '')} onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})} disabled={!isEditingProfile} />
               </div>
               <div>
                  <label className="text-overline" style={{ display: 'block', marginBottom: '8px' }}>Last Name</label>
                  <input type="text" className="modern-input" style={{ backgroundColor: isEditingProfile ? '#fff' : 'var(--bg-subtle)' }} value={isEditingProfile ? profileForm.lastName : (user?.name?.split(' ').slice(1).join(' ') || '')} onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})} disabled={!isEditingProfile} />
               </div>
               
               <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                  <label className="text-overline" style={{ display: 'block', marginBottom: '8px' }}>Email Address</label>
                  <input type="email" className="modern-input" style={{ backgroundColor: isEditingProfile ? '#fff' : 'var(--bg-subtle)' }} value={isEditingProfile ? profileForm.email : user?.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} disabled={!isEditingProfile} />
               </div>

               <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                  <label className="text-overline" style={{ display: 'block', marginBottom: '8px' }}>Mobile Number</label>
                  <input type="tel" className="modern-input" style={{ backgroundColor: 'var(--bg-subtle)' }} value="+91 999 888 7777" disabled />
                  <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '8px' }}>Verified with OTP</p>
               </div>
            </div>

            <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid var(--border)' }}>
                <h3 className="text-h2" style={{ marginBottom: '24px' }}>FAQs & Help</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-1)', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                        <Bell size={18} color="var(--primary)" /> Notification Settings
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-1)', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                        <MessageSquare size={18} color="var(--primary)" /> Chat Support
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="modern-card free-padding">
            <h2 className="text-h2" style={{ marginBottom: '40px' }}>Manage Addresses</h2>
            
            {!isAddingAddress && (
              <button 
                className="btn-outline"
                style={{ width: '100%', padding: '24px', justifyContent: 'center', marginBottom: '32px', borderStyle: 'dashed', borderWidth: '2px' }}
                onClick={() => setIsAddingAddress(true)}
              >
                <Plus size={22} /> ADD A NEW SHIPPING ADDRESS
              </button>
            )}

            {isAddingAddress && (
              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '32px', borderRadius: '12px', marginBottom: '40px', border: '1.5px solid var(--primary)' }}>
                <h3 className="text-overline" style={{ marginBottom: '24px', fontSize: '14px' }}>Add New Shipping Address</h3>
                <form onSubmit={handleAddAddress} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <input required type="text" placeholder="Full Name" className="modern-input" value={addressForm.name} onChange={(e) => setAddressForm({...addressForm, name: e.target.value})} />
                  </div>
                  <div>
                    <input required type="text" placeholder="City" className="modern-input" value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} />
                  </div>
                  <div>
                    <input required type="text" placeholder="PIN Code" className="modern-input" value={addressForm.postalCode} onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <textarea required placeholder="Full Address (Area, Street, Landmark)" className="modern-input" style={{ minHeight: '100px' }} value={addressForm.street} onChange={(e) => setAddressForm({...addressForm, street: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <input required type="tel" placeholder="Mobile Number" className="modern-input" value={addressForm.phone} onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '20px', marginTop: '16px' }}>
                    <button type="submit" className="btn-primary" style={{ padding: '12px 48px' }}>SAVE ADDRESS</button>
                    <button type="button" style={{ background: 'transparent', border: 'none', fontWeight: '800', color: 'var(--text-3)', cursor: 'pointer', fontSize: '13px' }} onClick={() => setIsAddingAddress(false)}>CANCEL</button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {addresses.map(addr => (
                <div key={addr._id || addr.id} className="hover-card" style={{ padding: '24px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <MapPin size={18} color="var(--primary)" />
                      <div style={{ fontWeight: '800', fontSize: '15px' }}>{addr.name}</div>
                    </div>
                    <button 
                      onClick={() => handleDeleteAddress(addr._id || addr.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-1)', fontWeight: '600', marginBottom: '8px' }}>
                    {addr.phone}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: '1.6' }}>
                    {addr.street}, {addr.city} - {addr.postalCode}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Account;
