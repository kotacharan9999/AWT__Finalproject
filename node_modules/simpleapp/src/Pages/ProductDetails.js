import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap, Star, Heart, ShieldCheck, Truck, RefreshCw, BadgePercent, MapPin } from 'lucide-react';
import SafeImage from '../Components/SafeImage';

const ProductDetails = ({ addToCart, wishlist, toggleWishlist, user, showToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    // Fetch specific product by ID
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
        
        // Fetch similar products after main product is loaded
        fetch(`/api/products?category=${encodeURIComponent(data.category)}&limit=20`)
          .then(r => r.json())
          .then(d => {
            const filtered = d.products?.filter(p => parseInt(p.id) !== parseInt(data.id)).slice(0, 6) || [];
            setSimilarProducts(filtered);
          })
          .catch(console.error);
      })
      .catch(err => {
        console.error('Error fetching product:', err);
        setLoading(false);
      });

    // Fetch reviews for this product
    fetch(`/api/products/${id}/reviews`)
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(console.error);
  }, [id]);

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
        const res = await fetch(`/api/products/${id}/reviews`, {
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

  if (loading) return <div className="container free-padding" style={{ textAlign: 'center' }}><div className="skeleton" style={{ height: '300px', width: '100%' }} /></div>;

  if (!product) {
    return (
      <div className="container modern-card free-padding" style={{ textAlign: 'center', marginTop: '60px' }}>
        <div style={{ fontSize: '72px', marginBottom: '24px' }}>🤷</div>
        <h2 className="text-h1" style={{ marginBottom: '24px' }}>Product not found</h2>
        <Link to="/products" className="btn-primary">Return to Catalog</Link>
      </div>
    );
  }

  const inWishlist = wishlist && wishlist.find(w => parseInt(w.id) === parseInt(product.id));
  const averageRating = (reviews && Array.isArray(reviews) && reviews.length > 0) 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : (product?.rating || '4.5');
  const totalReviews = (reviews && Array.isArray(reviews)) ? reviews.length : 142;

  return (
    <div className="container" style={{ padding: '40px 32px 80px' }}>
      
      <div className="modern-split-layout free-gap">
        
        {/* Left Column - Gallery */}
        <div style={{ position: 'sticky', top: '100px', width: '480px' }}>
          <div className="modern-card" style={{ padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '540px', background: '#fff', position: 'relative' }}>
            <button 
              style={{ 
                position: 'absolute', top: '24px', right: '24px', zIndex: 10, 
                background: '#fff', border: '1px solid var(--border)', borderRadius: '50%', 
                width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                cursor: 'pointer', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)',
                color: inWishlist ? 'var(--accent)' : 'var(--text-3)'
              }}
              onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            >
              <Heart size={22} fill={inWishlist ? "currentColor" : "none"} />
            </button>
            <SafeImage src={product.image} alt={product.name} productId={product.id} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
            <button className="btn-primary" style={{ flex: 1, height: '56px', fontSize: '15px' }} onClick={() => addToCart(product)}>
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <button className="btn-gradient buy-now" style={{ flex: 1, height: '56px', fontSize: '15px' }} onClick={handleBuyNow}>
              <Zap size={20} /> Buy Now
            </button>
          </div>
          
          {/* Trust Badges */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', padding: '16px 8px', borderTop: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'center' }}>
                <ShieldCheck size={20} color="var(--success)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-2)' }}>SECURE TRANSACTION</div>
            </div>
            <div style={{ textAlign: 'center' }}>
                <RefreshCw size={20} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-2)' }}>7 DAYS REPLACEMENT</div>
            </div>
            <div style={{ textAlign: 'center' }}>
                <Truck size={20} color="var(--gold)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-2)' }}>FAST FREE DELIVERY</div>
            </div>
          </div>
        </div>

        {/* Right Column - Info */}
        <main style={{ paddingBottom: '40px' }}>
          <div className="text-overline" style={{ marginBottom: '12px', color: 'var(--primary)' }}>{product.category} • {product.brand}</div>
          <h1 className="text-h1" style={{ marginBottom: '16px', lineHeight: '1.1' }}>{product.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--success)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '15px', fontWeight: '800' }}>
              {averageRating} <Star size={13} fill="#fff" color="#fff" />
            </span>
            <span style={{ color: 'var(--text-2)', fontSize: '14px', fontWeight: '600' }}>{totalReviews} Ratings & 42 Reviews</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: '700', fontSize: '14px' }}>
                <MapPin size={14} /> Check Availability
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px', marginBottom: '32px' }}>
            <span style={{ fontSize: '44px', fontWeight: '900', color: 'var(--text-1)', letterSpacing: '-1.5px' }}>₹{product?.price?.toLocaleString('en-IN') || '0'}</span>
            <span style={{ color: 'var(--text-3)', textDecoration: 'line-through', fontSize: '22px' }}>₹{(product?.price * 1.3)?.toLocaleString('en-IN') || '0'}</span>
            <span style={{ color: 'var(--accent)', fontSize: '18px', fontWeight: '800' }}>30% off</span>
          </div>

          {/* Offers Panel */}
          <div className="modern-card" style={{ marginBottom: '40px', padding: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-1)', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <BadgePercent size={18} color="var(--accent)" /> Available Offers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', fontSize: '14px', borderLeft: '3px solid var(--success)', paddingLeft: '16px' }}>
                <span><strong>Bank Offer</strong> 5% Cashback on ShopPlus Axis Bank Credit Card <Link to="#" style={{ color: 'var(--primary)', fontWeight: '800' }}>T&C</Link></span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '14px', borderLeft: '3px solid var(--success)', paddingLeft: '16px' }}>
                <span><strong>Special Price</strong> Get extra ₹{Math.round(product.price*0.1)} off (price inclusive of coupon) <Link to="#" style={{ color: 'var(--primary)', fontWeight: '800' }}>T&C</Link></span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '14px', borderLeft: '3px solid var(--success)', paddingLeft: '16px' }}>
                <span><strong>No Cost EMI</strong> Standard EMI from ₹{Math.round(product.price/12)}/month <Link to="#" style={{ color: 'var(--primary)', fontWeight: '800' }}>T&C</Link></span>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="modern-card" style={{ padding: 0, marginBottom: '40px' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)' }}>
              <h2 className="text-h2">Product Highlights</h2>
              <ul style={{ padding: '24px 0 0 20px', margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px', color: 'var(--text-2)' }}>
                <li>✅ Premium {product.brand} Quality</li>
                <li>✅ 12 Months Warranty</li>
                <li>✅ High Performance Specs</li>
                <li>✅ Sustainable Packaging</li>
                <li>✅ Trusted by 10k+ Users</li>
                <li>✅ Best in Category</li>
              </ul>
            </div>
            <div style={{ padding: '24px 32px' }}>
              <h2 className="text-h2" style={{ marginBottom: '24px' }}>Detailed Specifications</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                {[
                  { label: 'Model Name', value: product.name },
                  { label: 'Brand', value: product.brand },
                  { label: 'Category', value: product.category },
                  { label: 'Warranty', value: '1 Year Brand Warranty' },
                  { label: 'Seller', value: 'ShopPlus Choice (4.9 ★)' },
                  { label: 'Country of Origin', value: 'India' }
                ].map((spec, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '220px 1fr', background: 'var(--bg-card)', fontSize: '14px' }}>
                    <div style={{ padding: '16px 24px', background: 'var(--bg-subtle)', color: 'var(--text-2)', fontWeight: '700' }}>{spec.label}</div>
                    <div style={{ padding: '16px 24px', color: 'var(--text-1)', fontWeight: '500' }}>{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="modern-card free-padding" style={{ marginBottom: '40px' }}>
              <h2 className="text-h2" style={{ marginBottom: '16px' }}>Description</h2>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.8', color: 'var(--text-2)' }}>{product.description}</p>
          </div>
          
          {/* Reviews Section */}
          <div className="modern-card free-padding">
             <h2 className="text-h2" style={{ marginBottom: '32px' }}>Ratings & Reviews</h2>
             
             {user ? (
                 <form onSubmit={submitReview} style={{ marginBottom: '40px', padding: '24px', background: 'var(--bg-subtle)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 20px', fontSize: '15px' }}>Write a Review</h4>
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
                        <div>
                            <label className="text-overline" style={{ display: 'block', marginBottom: '8px' }}>Rating</label>
                            <select className="modern-input" style={{ width: '100px' }} value={rating} onChange={e => setRating(Number(e.target.value))}>
                                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="text-overline" style={{ display: 'block', marginBottom: '8px' }}>Your Experience</label>
                            <textarea required className="modern-input" placeholder="Tell us what you liked..." rows={3} value={comment} onChange={e => setComment(e.target.value)} />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: '10px 32px' }}>Submit Feedback</button>
                 </form>
             ) : (
                 <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-subtle)', borderRadius: '12px', marginBottom: '40px' }}>
                     <p style={{ margin: '0 0 16px', color: 'var(--text-2)' }}>Bought this product? Share your thoughts!</p>
                     <Link to="/auth" className="btn-outline">Sign In to Review</Link>
                 </div>
             )}

             <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                 {reviews.length > 0 ? reviews.map(rev => (
                     <div key={rev._id} style={{ paddingBottom: '32px', borderBottom: '1px solid var(--border)' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                 <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>{rev.userName[0]}</div>
                                 <div style={{ fontSize: '15px', fontWeight: '800' }}>{rev.userName} <span style={{ color: 'var(--success)', fontSize: '11px', marginLeft: '6px' }}>✔ Certified Buyer</span></div>
                             </div>
                             <div style={{ display: 'flex', gap: '2px', color: 'var(--gold)' }}>
                                 {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < rev.rating ? 'currentColor' : 'none'} />)}
                             </div>
                         </div>
                         <p style={{ margin: '0 0 8px 52px', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-1)', fontWeight: '600' }}>{rev.comment}</p>
                         <div style={{ fontSize: '12px', color: 'var(--text-3)', marginLeft: '52px' }}>Posted on {new Date(rev.date).toLocaleDateString()}</div>
                     </div>
                 )) : (
                     <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)', fontStyle: 'italic' }}>No customer reviews yet.</div>
                 )}
             </div>
          </div>
        </main>
      </div>

      {/* Similar Products */}
      <div style={{ marginTop: '48px' }}>
        <h2 className="text-h2" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <RefreshCw size={24} color="var(--primary)" /> Similar Products You May Like
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
          {similarProducts.map(item => (
            <div key={item.id} className="hover-card" style={{ padding: '16px' }} onClick={() => { window.scrollTo(0, 0); navigate(`/product/${item.id}`); }}>
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <SafeImage src={item.image} alt={item.name} productId={item.id} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-1)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
              <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-1)' }}>₹{item.price.toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ProductDetails;
