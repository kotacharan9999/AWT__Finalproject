import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Toast from './Components/Toast';
import Footer from './Components/Footer';
import ThemeCustomizer from './Components/ThemeCustomizer';
import CartDrawer from './Components/CartDrawer';

// Pages
import Home from './Pages/Home';
import Products from './Pages/Products';
import ProductDetails from './Pages/ProductDetails';
import Cart from './Pages/Cart';
import Auth from './Pages/Auth';
import Wishlist from './Pages/Wishlist';
import Account from './Pages/Account';
import Checkout from './Pages/Checkout';
import OrderSuccess from './Pages/OrderSuccess';
import AdminDashboard from './Pages/AdminDashboard';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('shopease_theme');
    return saved === 'dark';
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('shopease_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('shopease_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shopease_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [themeSettings, setThemeSettings] = useState(() => {
    const saved = localStorage.getItem('shopease_theme_settings');
    return saved ? JSON.parse(saved) : {
      primaryColor: '#0d9488', // Apple-esque Teal
      accentColor: '#FF6F61',
      cornerStyle: 'rounded'
    };
  });

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('shopease_user', JSON.stringify(user));
      // Fetch user's encrypted addresses and real orders
      fetch(`http://localhost:5000/api/users/${user.email}/addresses`, { headers: { 'Authorization': `Bearer ${user.token}` } })
        .then(res => res.json())
        .then(data => setAddresses(data))
        .catch(console.error);
        
      fetch(`http://localhost:5000/api/orders/${user.email}`, { headers: { 'Authorization': `Bearer ${user.token}` } })
        .then(res => res.json())
        .then(data => setOrders(data))
        .catch(console.error);
        
      // Fetch user's cart and wishlist
      fetch(`http://localhost:5000/api/users/${user.email}/state`, { headers: { 'Authorization': `Bearer ${user.token}` } })
        .then(res => res.json())
        .then(data => {
            if(data.cart && data.cart.length > 0) setCart(data.cart);
            if(data.wishlist && data.wishlist.length > 0) setWishlist(data.wishlist);
        })
        .catch(console.error);
    } else {
      localStorage.removeItem('shopease_user');
      setAddresses([]);
      setOrders([]);
      // We don't clear cart on logout so guests can keep shopping
    }
  }, [user]);

  // Keep theme setup
  // Apply Theme Settings
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', themeSettings.primaryColor);
    root.style.setProperty('--accent-color', themeSettings.accentColor);
    
    if (themeSettings.cornerStyle === 'sharp') {
      root.style.setProperty('--radius-sm', '0px');
      root.style.setProperty('--radius-md', '0px');
      root.style.setProperty('--radius-search', '0px');
      root.style.setProperty('--radius-pill', '0px');
    } else if (themeSettings.cornerStyle === 'pill') {
      root.style.setProperty('--radius-sm', '20px');
      root.style.setProperty('--radius-md', '30px');
      root.style.setProperty('--radius-search', '50px');
      root.style.setProperty('--radius-pill', '50px');
    } else {
      root.style.setProperty('--radius-sm', '8px');
      root.style.setProperty('--radius-md', '12px');
      root.style.setProperty('--radius-search', '50px');
      root.style.setProperty('--radius-pill', '50px');
    }

    localStorage.setItem('shopease_theme_settings', JSON.stringify(themeSettings));
  }, [themeSettings]);

  useEffect(() => {
    localStorage.setItem('shopease_cart', JSON.stringify(cart));
    localStorage.setItem('shopease_wishlist', JSON.stringify(wishlist));
    
    // Sync to backend if logged in
    if (user && user.email) {
        fetch(`http://localhost:5000/api/users/${user.email}/state`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
            body: JSON.stringify({ cart, wishlist })
        }).catch(console.error);
    }
  }, [cart, wishlist, user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ message: '', type: '', visible: false });
    }, 3000);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`${product.name} added to cart!`, 'success');
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    showToast('Item removed from cart.', 'info');
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      if (prev.find(item => item.id === product.id)) {
         showToast('Removed from Wishlist', 'info');
         return prev.filter(item => item.id !== product.id);
      }
      showToast('Added to Wishlist!', 'success');
      return [...prev, product];
    });
  };

  const placeOrder = async (orderItems, totalAmount) => {
    const newOrder = {
      userEmail: user.email,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      items: orderItems,
      total: totalAmount,
      status: 'Processing'
    };
    try {
      const resp = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(newOrder)
      });
      const savedOrder = await resp.json();
      setOrders(prev => [savedOrder, ...prev]);
    } catch(err) {
      console.error(err);
      showToast('Error placing order!', 'error');
    }
  };

  const getCartCount = () => cart.reduce((total, item) => total + item.quantity, 0);
  const getWishlistCount = () => wishlist.length;

  return (
    <Router>
      {user && (
        <>
          <Navbar 
            cartItemCount={getCartCount()} 
            wishlistCount={getWishlistCount()} 
            user={user} 
            setUser={setUser}
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onOpenCart={() => setIsCartOpen(true)}
          />
          <CartDrawer 
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cart={cart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            getCartCount={getCartCount}
          />
        </>
      )}
      
      {toast.visible && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, visible: false })} 
        />
      )}

      {!user ? (
        <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
          <Routes>
            <Route path="/auth" element={<Auth setUser={setUser} showToast={showToast} />} />
            <Route path="*" element={<Navigate to="/auth" />} />
          </Routes>
        </div>
      ) : (
        <div style={{ minHeight: 'calc(100vh - 400px)' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={
              <Products addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />
            } />
            <Route path="/product/:id" element={
              <ProductDetails addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} user={user} showToast={showToast} />
            } />
            <Route path="/cart" element={<Navigate to="/checkout" />} />
            <Route path="/wishlist" element={
              <Wishlist wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} user={user} />
            } />
            <Route path="/checkout" element={
               <Checkout cart={cart} placeOrder={placeOrder} clearCart={clearCart} showToast={showToast} user={user} addresses={addresses} setAddresses={setAddresses} />
            } />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/account" element={<Account user={user} setUser={setUser} orders={orders} showToast={showToast} addresses={addresses} setAddresses={setAddresses} />} />
            <Route path="/admin" element={user.isAdmin ? <AdminDashboard user={user} showToast={showToast} /> : <Navigate to="/" />} />
            <Route path="/auth" element={user.isAdmin ? <Navigate to="/admin" /> : <Navigate to="/account" />} />
            <Route path="/login" element={<Navigate to="/auth" />} />
            <Route path="/signup" element={<Navigate to="/auth" />} />
            <Route path="/welcome" element={<Navigate to="/account" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      )}

      {user && (
        <>
          <Footer />
          <ThemeCustomizer themeSettings={themeSettings} setThemeSettings={setThemeSettings} />
        </>
      )}
    </Router>
  );
}

export default App;


