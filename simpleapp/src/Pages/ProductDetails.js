import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap, Star, Heart } from 'lucide-react';

const ProductDetails = ({ addToCart, wishlist, toggleWishlist, user, showToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });

    // Fetch reviews
    fetch(`http://localhost:5000/api/products/${id}/reviews`)
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(console.error);
  }, [id]);

  const product = products.find(p => parseInt(p.id) === parseInt(id));

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/checkout');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
        showToast('Please sign in to submit a review', 'error');
        return;
    }
    try {
        const res = await fetch(`http://localhost:5000/api/products/${id}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
            body: JSON.stringify({
                userEmail: user.email,
                userName: user.name,
                rating,
                comment
            })
        });
        if(res.ok) {
            const newReview = await res.json();
            setReviews([newReview, ...reviews]);
            setComment('');
            setRating(5);
            showToast('Review submitted successfully!', 'success');
        }
    } catch(err) {
        showToast('Error submitting review', 'error');
    }
  };

  if (loading) {
    return <div className="container" style={{ margin: '40px auto', textAlign: 'center' }}><h2>Loading...</h2></div>;
  }

  if (!product) {
    return (
      <div className="container modern-card" style={{ padding: '80px 40px', textAlign: 'center', marginTop: '40px' }}>
        <h2 className="text-h2" style={{ marginBottom: '24px' }}>Product not found</h2>
        <Link to="/products" className="btn-gradient">Back to Products</Link>
      </div>
    );
  }

  const inWishlist = wishlist && wishlist.find(w => parseInt(w.id) === parseInt(product.id));
  const similarProducts = products.filter(p => p.category === product.category && parseInt(p.id) !== parseInt(product.id)).slice(0, 4);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating;
  const totalReviews = reviews.length > 0 ? reviews.length : 180;

  return (
    <div className="container" style={{ margin: '40px auto', padding: '0 24px' }}>
      
      {/* Product Split Details */}
      <div className="modern-split-layout" style={{ 
        gridTemplateColumns: '1fr 1fr', 
        gap: '40px', 
        marginBottom: '60px',
        alignItems: 'start' 
      }}>
        
        {/* Left Gallery (Sticky) */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div className="modern-card" style={{ 
            height: '500px', 
            display: 'block',
            marginBottom: '24px', 
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#fff'
          }}>
            
            <button 
              style={{ 
                position: 'absolute', top: '24px', right: '24px', zIndex: 10, 
                background: 'var(--glass-bg)', backdropFilter: 'blur(4px)',
                border: '1px solid var(--border-light)', borderRadius: '50%', 
                width: '48px', height: '48px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                cursor: 'pointer', transition: 'all var(--transition-fast)',
                color: inWishlist ? 'var(--accent-color)' : 'var(--text-tertiary)'
              }}
              onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            >
              <Heart size={24} fill={inWishlist ? "currentColor" : "none"} />
            </button>

            <img src={product.image} alt={product.name} className="img-contain" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn-outline" style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', color: 'var(--primary-color)' }} onClick={() => addToCart(product)}>
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <button className="btn-gradient" style={{ flex: 1 }} onClick={handleBuyNow}>
              <Zap size={20} /> Buy Now
            </button>
          </div>
        </div>

        {/* Right Information */}
        <div style={{ padding: '24px 0' }}>
          <div className="text-overline" style={{ marginBottom: '16px', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.category} • {product.brand}</div>
          <h1 className="text-h1" style={{ marginBottom: '24px', lineHeight: '1.2' }}>{product.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <span style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              backgroundColor: 'var(--warning)', color: '#fff', 
              padding: '4px 8px', borderRadius: '4px', fontSize: '14px', fontWeight: '600'
            }}>
              {averageRating} ★
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>{totalReviews} Reviews</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '40px' }}>
            <span style={{ fontSize: '40px', fontWeight: '700', letterSpacing: '-1px' }}>₹{product.price.toFixed(2)}</span>
            <span style={{ color: 'var(--text-tertiary)', textDecoration: 'line-through', fontSize: '20px' }}>₹{(product.price * 1.2).toFixed(2)}</span>
            <span style={{ color: 'var(--success)', fontSize: '16px', fontWeight: '600' }}>20% off</span>
          </div>

          <div className="modern-card" style={{ marginBottom: '40px' }}>
            <h2 className="text-h2" style={{ marginBottom: '24px' }}>Product Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', fontSize: '15px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ color: 'var(--text-secondary)' }}>Brand</div>
              <div style={{ fontWeight: '500' }}>{product.brand}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', fontSize: '15px', paddingTop: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ color: 'var(--text-secondary)' }}>Delivery</div>
              <div style={{ fontWeight: '500' }}>Usually delivered in 2-3 business days.</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', fontSize: '15px', paddingTop: '16px', lineHeight: '1.6' }}>
              <div style={{ color: 'var(--text-secondary)' }}>Description</div>
              <div>{product.description}</div>
            </div>
          </div>
          
          {/* REVIEWS SECTION */}
          <div className="modern-card" style={{ marginBottom: '40px' }}>
             <h2 className="text-h2" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
                Customer Reviews
             </h2>
             
             {user ? (
                 <form onSubmit={submitReview} style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <label className="text-overline" style={{ display: 'block', marginBottom: '8px' }}>Your Rating</label>
                        <select 
                            className="modern-input" 
                            style={{ width: '120px', cursor: 'pointer' }}
                            value={rating} 
                            onChange={(e) => setRating(Number(e.target.value))}
                        >
                            {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} ★</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label className="text-overline" style={{ display: 'block', marginBottom: '8px' }}>Your Review</label>
                        <textarea 
                            required
                            className="modern-input" 
                            placeholder="What did you think about this product?"
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-gradient">Submit Review</button>
                 </form>
             ) : (
                 <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: '32px', textAlign: 'center' }}>
                     <Link to="/auth" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Sign In</Link> to leave a review.
                 </div>
             )}

             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                 {reviews.length > 0 ? reviews.map(rev => (
                     <div key={rev._id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <strong style={{ fontSize: '15px' }}>{rev.userName}</strong>
                             <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{new Date(rev.date).toLocaleDateString()}</span>
                         </div>
                         <div style={{ display: 'flex', color: 'var(--warning)', fontSize: '14px', letterSpacing: '2px' }}>
                             {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                         </div>
                         <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                             {rev.comment}
                         </p>
                     </div>
                 )) : (
                     <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No reviews yet. Be the first!</div>
                 )}
             </div>
          </div>
        </div>
      </div>

      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <div style={{ marginTop: '20px', marginBottom: '80px' }}>
          <h2 className="text-h2" style={{ marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
            Similar Products You Might Like
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
            {similarProducts.map(item => (
              <div 
                key={item.id} 
                className="hover-card" 
                onClick={() => {
                  window.scrollTo(0,0);
                  navigate(`/product/${item.id}`);
                }}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ height: '200px', padding: '24px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={item.image} alt={item.name} className="img-contain" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className="text-overline" style={{ color: 'var(--primary-color)', marginBottom: '4px' }}>{item.brand}</div>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--warning)', marginBottom: '8px' }}>
                    {item.rating} ★
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '700', marginTop: 'auto' }}>₹{item.price.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetails;
