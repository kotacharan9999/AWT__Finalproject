import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, Moon, Sun, Monitor, Package, Shield, Settings, LogOut } from 'lucide-react';

const Navbar = ({ cartItemCount, wishlistCount, user, setUser, isDarkMode, setIsDarkMode, onOpenCart }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hoverAccount, setHoverAccount] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const delayFn = setTimeout(() => {
        fetch(`http://localhost:5000/api/products/search?q=${encodeURIComponent(searchQuery)}`)
          .then(res => res.json())
          .then(data => {
            setSuggestions(data);
            setShowSuggestions(true);
          })
          .catch(console.error);
      }, 300);
      return () => clearTimeout(delayFn);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <header className="floating-navbar" style={{ 
      transform: showNavbar ? 'translateY(0)' : 'translateY(-150%)',
      transition: 'transform 0.3s ease-in-out'
    }}>
      <div className="navbar-pill">
        
        {/* Left: Logo */}
        <Link to="/" className="logo-text" style={{ flexShrink: 0, fontSize: '20px' }}>
          Shop<span className="logo-accent">Ease</span>
        </Link>
        
        {/* Center: Search & Main Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div className="pill-links">
                <Link to="/products" className="pill-link">Products</Link>
                <Link to="/products?category=Electronics & Gadgets" className="pill-link">Tech</Link>
                <Link to="/products?category=Fashion & Apparel" className="pill-link">Fashion</Link>
            </div>
            
            <div ref={searchRef} style={{ position: 'relative', flexGrow: 1, maxWidth: '400px' }}>
              <form onSubmit={handleSearch} className="pill-search" style={{ width: '100%' }}>
                  <Search size={16} color="var(--text-tertiary)" style={{ marginRight: '8px' }} />
                  <input 
                      type="text" 
                      placeholder="Search for products, categories..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
                  />
              </form>
              
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px',
                  backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
                  borderRadius: '16px', boxShadow: '0 16px 40px rgba(0,0,0,0.12)', zIndex: 1000,
                  overflow: 'hidden', padding: '8px 0'
                }}>
                  <div style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                    Suggested Products
                  </div>
                  {suggestions.map(item => (
                    <div 
                      key={item.id}
                      style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                      onClick={() => {
                        setShowSuggestions(false);
                        setSearchQuery('');
                        navigate(`/product/${item.id}`);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', backgroundColor: '#fff', mixBlendMode: 'multiply' }} />
                      <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>in {item.category}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
            
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link to="/wishlist" style={{ position: 'relative', color: 'var(--text-secondary)' }}>
                <Heart size={20} />
                {wishlistCount > 0 && <span className="pill-badge">{wishlistCount}</span>}
            </Link>

            <button onClick={onOpenCart} style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <ShoppingCart size={20} />
              {cartItemCount > 0 && <span className="pill-badge">{cartItemCount}</span>}
            </button>

            {/* Account Flow */}
            <div 
              style={{ position: 'relative' }} 
              onMouseEnter={() => setHoverAccount(true)} 
              onMouseLeave={() => setHoverAccount(false)}
            >
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 12px', borderRadius: '50px', background: 'var(--bg-primary)' }}>
                  <User size={18} color="var(--text-secondary)" />
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{user.name.split(' ')[0]}</span>
                </div>
              ) : (
                <button className="btn-gradient" onClick={() => navigate('/auth')} style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '50px' }}>
                  Sign In
                </button>
              )}
              
              {hoverAccount && user && (
                <div style={{ position: 'absolute', top: '100%', right: '0', background: 'var(--bg-secondary)', boxShadow: '0 16px 40px rgba(0,0,0,0.12)', border: '1px solid var(--border-light)', borderRadius: '16px', overflow: 'hidden', zIndex: 1000, minWidth: '220px', marginTop: '16px' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-primary)' }}>
                    <div style={{ fontWeight: '600' }}>Hello, {user.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user.email}</div>
                  </div>
                  
                  <Link to="/account" className="account-dropdown-item"><User size={16} /> My Profile</Link>
                  <Link to="/account" className="account-dropdown-item"><Package size={16} /> My Orders</Link>
                  
                  {user.isAdmin && (
                    <Link to="/admin" className="account-dropdown-item" style={{ color: 'var(--primary-color)' }}>
                      <Shield size={16} /> Owner Dashboard
                    </Link>
                  )}
                  
                  <div className="account-dropdown-item logout" onClick={handleLogout}>
                    <LogOut size={16} /> Log Out
                  </div>
                </div>
              )}
            </div>

        </div>

      </div>
    </header>
  );
};

export default Navbar;
