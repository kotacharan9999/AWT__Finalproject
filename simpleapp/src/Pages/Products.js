import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Products = ({ addToCart, wishlist, toggleWishlist }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortOrder, setSortOrder] = useState('popularity');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch all available brands for the filter sidebar
  useEffect(() => {
    fetch('http://localhost:5000/api/meta/brands')
      .then(res => res.json())
      .then(data => setBrands(data))
      .catch(console.error);
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', 20); // strictly page by 20 chunk to save bandwidth
        if (initialCategory) params.append('category', initialCategory);
        if (searchQuery) params.append('search', searchQuery);
        if (sortOrder) params.append('sort', sortOrder);
        if (selectedBrands.length > 0) params.append('brands', selectedBrands.join(','));

        try {
            const res = await fetch(`http://localhost:5000/api/products?${params.toString()}`);
            const data = await res.json();
            if (page === 1) {
                setProducts(data.products || []);
            } else {
                setProducts(prev => [...prev, ...data.products]);
            }
            setTotalPages(data.totalPages);
            setTotalItems(data.totalProducts);
        } catch(err) {
            console.error(err);
        }
        setLoading(false);
    };
    fetchProducts();
  }, [page, initialCategory, searchQuery, selectedBrands, sortOrder]);

  // Reset page to 1 when filters logically change natively
  useEffect(() => {
      setPage(1);
  }, [initialCategory, searchQuery, selectedBrands, sortOrder]);

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const isWishlisted = (id) => wishlist.some(item => item.id === id);

  return (
    <div className="container modern-split-layout" style={{ margin: '40px auto' }}>
      
      {/* Filters Sidebar */}
      <aside>
        <div className="modern-card" style={{ position: 'sticky', top: '100px', padding: '24px' }}>
          <h2 className="text-h2" style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
            Filters
          </h2>

          <div style={{ marginBottom: '32px' }}>
            <div className="text-overline" style={{ marginBottom: '16px' }}>Brands</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
              {brands.map(brand => (
                <label key={brand} className="modern-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>
          
          <button 
            className="btn-outline" 
            style={{ width: '100%' }}
            onClick={() => setSelectedBrands([])}
          >
            Clear Filters
          </button>
        </div>
      </aside>

      {/* Main Product Grid */}
      <main>
        <div className="modern-card" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>
             Showing <strong style={{ color: 'var(--primary-color)' }}>{products.length}</strong> of {totalItems} products
             {initialCategory && <span> in <strong style={{ color: 'var(--text-primary)' }}>{initialCategory}</strong></span>}
             {searchQuery && <span> matching <strong style={{ color: 'var(--text-primary)' }}>"{searchQuery}"</strong></span>}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Sort by:</span>
            <select 
              className="modern-input" 
              style={{ width: 'auto', padding: '8px 32px 8px 16px', borderRadius: 'var(--radius-pill)', cursor: 'pointer', appearance: 'none' }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="popularity">Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '24px' 
            }}>
            {products.map(product => (
                <div key={`${product.id}-${Math.random()}`} className="hover-card" style={{ position: 'relative' }}>
                
                <div 
                    style={{ position: 'relative', height: '260px', width: '100%', cursor: 'pointer', display: 'block', overflow: 'hidden', padding: '16px', backgroundColor: '#fff' }}
                    onClick={() => navigate(`/product/${product.id}`)}
                >
                    <button 
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                    style={{ 
                        position: 'absolute', top: '16px', right: '16px', zIndex: 10,
                        width: '36px', height: '36px', borderRadius: '50%',
                        backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid var(--border-light)', cursor: 'pointer',
                        color: isWishlisted(product.id) ? 'var(--accent-color)' : 'var(--text-tertiary)',
                        transition: 'all var(--transition-fast)'
                    }}
                    onMouseOver={(e) => { if(!isWishlisted(product.id)) e.currentTarget.style.color = 'var(--accent-color)'; }}
                    onMouseOut={(e) => { if(!isWishlisted(product.id)) e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                    >
                    <Heart size={18} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} />
                    </button>
                    <img src={product.image} alt={product.name} className="img-contain" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                
                <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div className="text-overline" style={{ color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.brand}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600', color: 'var(--warning)' }}>
                        {product.rating} ★
                    </div>
                    </div>
                    
                    <h3 onClick={() => navigate(`/product/${product.id}`)} style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', cursor: 'pointer', lineHeight: '1.5', flexGrow: 1, color: 'var(--text-primary)' }}>
                    {product.name}
                    </h3>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        ₹{product.price.toFixed(2)}
                    </div>
                    <button className="btn-gradient" onClick={(e) => { e.stopPropagation(); addToCart(product); }} style={{ padding: '8px 16px', fontSize: '14px' }}>
                        Add to Cart
                    </button>
                    </div>
                </div>

                </div>
            ))}
            {products.length === 0 && !loading && (
                <div className="modern-card" style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <h3 className="text-h2" style={{ marginBottom: '8px' }}>No products found</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters or search query.</p>
                </div>
            )}
            </div>

            {/* Load More Pagination */}
            {page < totalPages && (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '16px' }}>
                    <button 
                        className="btn-outline" 
                        style={{ padding: '12px 40px' }}
                        onClick={() => setPage(p => p + 1)}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Load More Products'}
                    </button>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default Products;
