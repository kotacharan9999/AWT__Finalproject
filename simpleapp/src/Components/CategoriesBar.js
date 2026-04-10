import React from 'react';
import { featuredCategories } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

const CategoriesBar = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      padding: '24px 0', 
      borderBottom: '1px solid var(--border-light)',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div className="container" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        
        <button className="modern-pill" onClick={() => navigate('/products?search=offers')}>
          ✨ Top Offers
        </button>
        
        <button className="modern-pill" onClick={() => navigate('/products')}>
          All Products
        </button>

        {featuredCategories.map((cat, idx) => (
          <button 
            key={idx} 
            className="modern-pill"
            onClick={() => navigate(`/products?category=${encodeURIComponent(cat)}`)}
          >
            {cat}
          </button>
        ))}

      </div>
    </div>
  );
};

export default CategoriesBar;
