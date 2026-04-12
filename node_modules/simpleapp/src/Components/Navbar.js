import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ShoppingCart, User, Heart, Package, Shield, LogOut,
  ChevronDown, MoreVertical, Contrast, LayoutGrid,
  RotateCcw, X, Settings, Menu
} from 'lucide-react';
import SafeImage from './SafeImage';

const CATEGORIES = [
  { label: 'Electronics',   emoji: '📱', link: '/products?category=Electronics & Gadgets',
    subs: ['Smartphones','Laptops','Audio','Televisions','Tablets','Cameras','Smartwatches','Peripherals'] },
  { label: 'Ladies Corner', emoji: '👗', link: '/products?category=Ladies Corner',
    subs: ['Sarees','Kurtis','Dresses','Jeans','Ethnic Wear','Footwear','Jewellery','Bags','Fragrances','Activewear'] },
  { label: 'Mens Corner',   emoji: '👔', link: '/products?category=Mens Corner',
    subs: ['Formal Shirts','T-Shirts','Trousers','Jackets','Suits','Footwear','Watches','Ethnic Wear','Accessories'] },
  { label: 'Grocery',       emoji: '🛒', link: '/products?category=Grocery',
    subs: ['Staples','Fresh Produce','Dairy','Beverages','Snacks','Cooking Oil','Pulses','Rice & Grains'] },
  { label: 'Home',          emoji: '🛋️', link: '/products?category=Home & Furniture',
    subs: ['Sofas','Beds','Dining','Lighting','Bedding','Storage','Curtains'] },
  { label: 'Appliances',    emoji: '🏠', link: '/products?category=Appliances & Kitchen',
    subs: ['Refrigerators','Washing Machines','Kitchen Appliances','Cookware','Cleaning'] },
  { label: 'Beauty',        emoji: '💄', link: '/products?category=Beauty & Personal Care',
    subs: ['Makeup','Skincare','Hair Care','Fragrances','Shaving'] },
  { label: 'Lifestyle',     emoji: '🏋️', link: '/products?category=Lifestyle & Hobbies',
    subs: ['Sports','Fitness','Musical Instruments','Books & E-Readers','Art & Craft','Board Games'] },
];

const POPULAR = ['iPhone 15 Pro', 'Samsung S24', 'Nike Shoes', 'Silk Saree', 'Gaming Laptop', 'Air Fryer'];

/* ── inline SettingsPanel ─────────────────────────────── */
const SettingsPanel = ({ themeSettings, setThemeSettings, onClose }) => {
  const defaultTheme = { primaryColor: '#3d5af1', accentColor: '#ff5533', density: 'compact', highContrast: false };
  const set = (k, v) => setThemeSettings(p => ({ ...p, [k]: v }));

  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
      width: '300px', background: '#fff',
      borderRadius: '12px', boxShadow: '0 8px 40px rgba(61,90,241,.18)',
      border: '1px solid #e8ebf5', zIndex: 1200,
      animation: 'slideDownFade 0.2s ease both', overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #e8ebf5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f4f6fb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#1a1d2e' }}>
          <Settings size={15} color="#3d5af1" /> Appearance
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, color: '#9ea3bb' }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Primary color */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ea3bb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Primary Colour</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['#3d5af1','#6d28d9','#0891b2','#16a34a','#dc2626','#db2777'].map(c => (
              <button key={c} onClick={() => set('primaryColor', c)}
                style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: themeSettings.primaryColor === c ? '3px solid #fff' : '2px solid transparent', outline: themeSettings.primaryColor === c ? `2px solid ${c}` : 'none', cursor: 'pointer', transition: 'transform 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.18)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            ))}
            <input type="color" value={themeSettings.primaryColor} onChange={e => set('primaryColor', e.target.value)}
              style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0, background: 'transparent' }}
              title="Custom colour"
            />
          </div>
        </div>

        {/* Layout density */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ea3bb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            <LayoutGrid size={11} style={{ display: 'inline', marginRight: '4px' }} /> Layout Density
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['compact', 'relaxed'].map(d => (
              <button key={d} onClick={() => set('density', d)}
                style={{ flex: 1, padding: '7px', fontSize: '12px', fontWeight: '700', textTransform: 'capitalize', borderRadius: '6px', border: 'none', cursor: 'pointer', background: themeSettings.density === d ? '#3d5af1' : '#f0f3fa', color: themeSettings.density === d ? '#fff' : '#5a5f7a', transition: 'all 0.15s' }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* High Contrast */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a1d2e', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Contrast size={13} /> High Contrast
            </div>
            <div style={{ fontSize: '11px', color: '#9ea3bb', marginTop: '2px' }}>Enhanced legibility</div>
          </div>
          <button onClick={() => set('highContrast', !themeSettings.highContrast)}
            style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.25s', background: themeSettings.highContrast ? '#3d5af1' : '#e8ebf5' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: themeSettings.highContrast ? '23px' : '3px', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,.18)' }} />
          </button>
        </div>

        {/* Reset */}
        <button onClick={() => setThemeSettings(defaultTheme)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', background: '#f0f3fa', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: '#5a5f7a', cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e8ebf5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f0f3fa'; }}
        >
          <RotateCcw size={13} /> Reset to Default
        </button>
      </div>
    </div>
  );
};

/* ── Main Navbar ──────────────────────────────────────── */
const Navbar = ({ cartItemCount, wishlistCount, user, setUser, onOpenCart, themeSettings, setThemeSettings }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Safe display name — guards against hash/corrupted data
  const getDisplayName = () => {
    const name = user?.name;
    if (!name || typeof name !== 'string') return 'User';
    if (/^[a-f0-9:]{16,}$/i.test(name)) {
      // Name is a hash string — use email username instead
      return user?.email?.split('@')[0] || 'User';
    }
    return name.split(' ')[0];
  };
  const displayName = user ? getDisplayName() : '';
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hoveredCat, setHoveredCat] = useState(null);
  const [hoverAccount, setHoverAccount] = useState(false);
  const searchRef = useRef(null);
  const settingsRef = useRef(null);
  const catTimerRef = useRef(null);
  const acctTimerRef = useRef(null);

  /* search autocomplete */
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const delay = setTimeout(() => {
        fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`)
          .then(r => r.json()).then(d => { setSuggestions(d); setShowSuggestions(true); })
          .catch(console.error);
      }, 250);
      return () => clearTimeout(delay);
    } else setSuggestions([]);
  }, [searchQuery]);

  /* close on outside click */
  useEffect(() => {
    const h = e => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setShowSettings(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => { setUser(null); navigate('/'); };

  const catEnter = label => { clearTimeout(catTimerRef.current); setHoveredCat(label); };
  const catLeave = () => { catTimerRef.current = setTimeout(() => setHoveredCat(null), 160); };
  const acctEnter = () => { clearTimeout(acctTimerRef.current); setHoverAccount(true); };
  const acctLeave = () => { acctTimerRef.current = setTimeout(() => setHoverAccount(false), 160); };

  /* nav bg = themeSettings.primaryColor if set */
  const navBg = (themeSettings?.primaryColor) || '#3d5af1';

  return (
    <header style={{ width: '100%', position: 'sticky', top: 0, zIndex: 900, boxShadow: '0 2px 12px rgba(0,0,0,.18)' }}>

      {/* ── TOP BAR ──────────────────────────────────── */}
      <nav style={{ background: navBg, backdropFilter: 'blur(10px)', borderBottom: `1px solid ${navBg === 'transparent' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.1)'}`, transition: 'background 0.3s ease' }}>
        <div className="inner nav-container" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '13px 24px', maxWidth: '1600px', margin: '0 auto' }}>

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(true)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}>
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link to="/" className="nav-brand" style={{ textDecoration: 'none', flexShrink: 0, lineHeight: 1 }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '24px', fontWeight: '900', color: '#fff', fontStyle: 'italic', letterSpacing: '-0.5px' }}>
              Shop<span style={{ color: '#f0b429' }}>Plus</span>
            </div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,.7)', fontStyle: 'italic', letterSpacing: '1.5px', marginTop: '-2px' }}>
              Explore <span style={{ color: '#f0b429', fontWeight: '800' }}>Plus</span>
            </div>
          </Link>

          {/* Search */}
          <div ref={searchRef} style={{ flex: 1, position: 'relative', maxWidth: '600px' }}>
            <form onSubmit={handleSearch} className="nav-search-form" style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.14)' }}>
              <select className="nav-search-select" style={{ border: 'none', outline: 'none', padding: '0 12px', fontSize: '13px', color: '#5a5f7a', background: '#f4f6fb', height: '42px', cursor: 'pointer', borderRight: '1px solid #e8ebf5' }}>
                <option>All</option>
                {CATEGORIES.map(c => <option key={c.label}>{c.label}</option>)}
              </select>
              <input
                type="text" placeholder="Search products, brands and more…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                style={{ flex: 1, border: 'none', outline: 'none', padding: '0 14px', fontSize: '14px', height: '42px', color: '#1a1d2e', fontFamily: 'inherit' }}
              />
              <button type="submit" style={{ background: '#f0b429', border: 'none', padding: '0 18px', height: '42px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Search size={18} color="#fff" strokeWidth={2.5} />
              </button>
            </form>

            {/* Search Suggestions */}
            {showSuggestions && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fff', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,.14)', zIndex: 999, maxHeight: '400px', overflowY: 'auto', border: '1px solid #e8ebf5' }}>
                {searchQuery.trim().length > 1 && suggestions.length > 0 ? (
                  <>
                    <div style={{ padding: '8px 14px', fontSize: '10px', fontWeight: '700', color: '#9ea3bb', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #f0f3fa' }}>Results</div>
                    {suggestions.slice(0, 8).map(item => (
                      <div key={item.id} onClick={() => { setShowSuggestions(false); setSearchQuery(''); navigate(`/product/${item.id}`); }}
                        style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f4f6fb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <SafeImage src={item.image} alt={item.name} productId={item.id} style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #e8ebf5' }} />
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontSize: '13px', color: '#1a1d2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                          <div style={{ fontSize: '11px', color: '#9ea3bb' }}>{item.category}</div>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#1a1d2e', whiteSpace: 'nowrap' }}>₹{item.price?.toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div style={{ padding: '8px 14px', fontSize: '10px', fontWeight: '700', color: '#9ea3bb', textTransform: 'uppercase', letterSpacing: '0.1em' }}>🔥 Trending Now</div>
                    {POPULAR.map(term => (
                      <div key={term} onClick={() => { setSearchQuery(term); navigate(`/products?search=${encodeURIComponent(term)}`); setShowSuggestions(false); }}
                        style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#1a1d2e' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f4f6fb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Search size={13} color="#9ea3bb" /> {term}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginLeft: 'auto', flexShrink: 0 }}>

            {/* Account */}
            <div style={{ position: 'relative' }} onMouseEnter={acctEnter} onMouseLeave={acctLeave}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#fff', padding: '4px 2px' }}>
                {user ? (
                  <>
                    <User size={16} />
                    <span style={{ fontSize: '14px', fontWeight: '700' }}>{displayName}</span>
                    <ChevronDown size={13} />
                  </>
                ) : (
                  <button onClick={() => navigate('/auth')}
                    style={{ background: '#fff', color: navBg, border: 'none', padding: '7px 28px', fontSize: '13px', fontWeight: '800', borderRadius: '6px', cursor: 'pointer', letterSpacing: '0.3px' }}>
                    Login
                  </button>
                )}
              </div>

              {hoverAccount && user && (
                <div className="nav-hover-dropdown" style={{ minWidth: '230px', right: 0 }}>
                  <div style={{ padding: '14px 18px', background: '#f4f6fb', borderBottom: '1px solid #e8ebf5' }}>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#1a1d2e' }}>Hello, {displayName} 👋</div>
                    <div style={{ fontSize: '12px', color: '#9ea3bb', marginTop: '2px' }}>{user?.email}</div>
                  </div>
                  {[{ to: '/account', icon: <User size={14} />, label: 'My Profile' }, { to: '/orders', icon: <Package size={14} />, label: 'My Orders' }, { to: '/wishlist', icon: <Heart size={14} />, label: 'My Wishlist' }].map(item => (
                    <Link key={item.to} to={item.to} className="account-dropdown-item">
                      <span style={{ color: '#9ea3bb' }}>{item.icon}</span> {item.label}
                    </Link>
                  ))}
                  {user.isAdmin && (
                    <Link to="/admin" className="account-dropdown-item" style={{ color: navBg, fontWeight: '700' }}>
                      <Shield size={14} /> Owner Dashboard
                    </Link>
                  )}
                  <div className="account-dropdown-item logout" onClick={handleLogout}>
                    <LogOut size={14} /> Logout
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link to="/wishlist" style={{ position: 'relative', color: '#fff', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Heart size={20} />
              {wishlistCount > 0 && <span className="pill-badge">{wishlistCount}</span>}
              <span className="nav-action-label" style={{ fontSize: '13px', fontWeight: '600' }}>Wishlist</span>
            </Link>

            {/* Cart */}
            <button onClick={onOpenCart} style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ position: 'relative' }}>
                <ShoppingCart size={20} />
                {cartItemCount > 0 && <span className="pill-badge">{cartItemCount}</span>}
              </div>
              <span className="nav-action-label" style={{ fontSize: '13px', fontWeight: '600' }}>Cart</span>
            </button>

            {user.isAdmin && (
              <Link to="/admin" className="nav-admin-btn" style={{ background: '#fff', color: navBg, borderRadius: '12px', padding: '10px 16px', fontWeight: '700', fontSize: '13px', textDecoration: 'none', boxShadow: '0 2px 10px rgba(0,0,0,.12)' }}>
                Owner Dashboard
              </Link>
            )}
            {/* Three-dot Settings ⋯ */}
            {setThemeSettings && (
              <div ref={settingsRef} style={{ position: 'relative' }}>
                <button onClick={() => setShowSettings(p => !p)}
                  className="nav-settings-btn"
                  style={{ background: 'rgba(255,255,255,.22)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  title="Settings"
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.25)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'}
                >
                  <MoreVertical size={18} />
                </button>
                {showSettings && (
                  <SettingsPanel themeSettings={themeSettings} setThemeSettings={setThemeSettings} onClose={() => setShowSettings(false)} />
                )}
              </div>
            )}

          </div>
        </div>
      </nav>

      {/* ── CATEGORY BAR ─────────────────────────────── */}
      <div className="category-bar-wrapper" style={{ background: '#fff', borderBottom: '1px solid #e8ebf5', boxShadow: '0 1px 4px rgba(0,0,0,.05)', width: '100%' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <div key={cat.label} style={{ position: 'relative' }} onMouseEnter={() => catEnter(cat.label)} onMouseLeave={catLeave}>
              <div onClick={() => navigate(cat.link)}
                style={{ padding: '10px 18px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderBottom: hoveredCat === cat.label ? `2px solid ${navBg}` : '2px solid transparent', transition: 'border-color 0.15s', minWidth: '72px' }}
              >
                <span style={{ fontSize: '20px' }}>{cat.emoji}</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: hoveredCat === cat.label ? navBg : '#1a1d2e' }}>{cat.label}</span>
              </div>

              {hoveredCat === cat.label && (
                <div onMouseEnter={() => catEnter(cat.label)} onMouseLeave={catLeave}
                  style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,.14)', borderRadius: '10px', zIndex: 1001, minWidth: '190px', padding: '8px 0', border: '1px solid #e8ebf5', animation: 'slideDownFade 0.16s ease both' }}
                >
                  {cat.subs.map(sub => (
                    <div key={sub}
                      onClick={() => { navigate(`${cat.link}&sub=${encodeURIComponent(sub)}`); setHoveredCat(null); }}
                      style={{ padding: '9px 16px', fontSize: '13px', color: '#1a1d2e', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f4f6fb'; e.currentTarget.style.color = navBg; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1a1d2e'; }}
                    >
                      {sub}
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #f0f3fa', margin: '4px 0' }} />
                  <div onClick={() => { navigate(cat.link); setHoveredCat(null); }}
                    style={{ padding: '9px 16px', fontSize: '12px', color: navBg, cursor: 'pointer', fontWeight: '800' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f4f6fb'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    View All →
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)} />
          <div className={`mobile-menu-content ${isMobileMenuOpen ? 'open' : ''}`}>
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f3fa' }}>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '24px', fontWeight: '900', color: 'var(--primary-color)' }}>
                Shop<span style={{ color: '#f0b429' }}>Plus</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#9ea3bb' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '20px 0', overflowY: 'auto', height: 'calc(100% - 80px)' }}>
              <div style={{ padding: '0 24px 10px', fontSize: '11px', fontWeight: '700', color: '#9ea3bb', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Categories</div>
              {CATEGORIES.map(cat => (
                <Link key={cat.label} to={cat.link} onClick={() => setIsMobileMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '14px 24px', textDecoration: 'none', color: '#1a1d2e', fontWeight: '600', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f4f6fb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '20px' }}>{cat.emoji}</span>
                  {cat.label}
                </Link>
              ))}
              
              <div style={{ margin: '20px 24px', padding: '15px 0', borderTop: '1px solid #f0f3fa' }}>
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--primary-color)', fontWeight: '700', textDecoration: 'none' }}>
                  <Shield size={18} /> Owner Dashboard
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
