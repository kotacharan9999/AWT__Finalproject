import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const heroSlides = [
  {
    title: "Pro. Beyond.",
    subtitle: "Titanium. So strong. So light. So Pro.",
    image: "https://images.unsplash.com/photo-1695048132800-4b360ae32a39?w=1200&q=80",
    link: "/products?search=iPhone%2015",
    color: "#fff", bg: "#1a1a1a"
  },
  {
    title: "Mind-blowing. Head-turning.",
    subtitle: "The most advanced Mac ever built.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80",
    link: "/products?search=MacBook",
    color: "#fff", bg: "#4a4e69"
  },
  {
    title: "Sound that moves you.",
    subtitle: "Premium active noise cancellation.",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1200&q=80",
    link: "/products?search=Headphones",
    color: "#fff", bg: "#8d99ae"
  }
];

const flipkartCategories = [
  { name: 'Top Offers', icon: '🔥', link: '/products' },
  { name: 'Mobiles', icon: '📱', link: '/products?category=Smartphones' },
  { name: 'Fashion', icon: '👕', link: '/products?category=Fashion' },
  { name: 'Electronics', icon: '💻', link: '/products?category=Electronics' },
  { name: 'Home', icon: '🛋️', link: '/products?category=Home' },
  { name: 'Travel', icon: '✈️', link: '/products?category=Travel' },
  { name: 'Appliances', icon: '📺', link: '/products?category=Appliances' },
  { name: 'Toys & More', icon: '🧸', link: '/products?category=Toys' },
  { name: 'Beauty', icon: '💄', link: '/products?category=Beauty' },
];

const topCategories = [
  { name: 'Electronics', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80' },
  { name: 'Fashion', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80' },
  { name: 'Smart Home & Security', img: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80' },
  { name: 'Sports & Fitness', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80' },
  { name: 'Kitchen & Dining', img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4f?w=600&q=80' },
  { name: 'Beauty & Personal Care', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80' },
];

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ h: 5, m: 34, s: 12 });

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        s--;
        if(s < 0) { s = 59; m--; }
        if(m < 0) { m = 59; h--; }
        if(h < 0) h = 23;
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(err => console.error('Error fetching products:', err));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const featured = products.slice(0, 4);
  const deals = products.slice(4, 9);

  return (
    <div style={{ paddingBottom: '80px', paddingTop: '100px' }}>

      {/* Flipkart Style Top Categories Strip */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px 0', borderBottom: '1px solid var(--border-light)', marginBottom: '32px', overflowX: 'auto', margin: '0 24px 32px 24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', gap: '20px', minWidth: '800px', padding: '0 24px' }}>
          {flipkartCategories.map((cat, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'} onClick={() => navigate(cat.link)}>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--bg-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '28px', marginBottom: '8px', border: '1px solid var(--border-light)' }}>
                {cat.icon}
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>
      
      {/* Hero Interactive Slider */}
      <section className="hero-slider" style={{ marginBottom: '60px' }}>
        {heroSlides.map((slide, index) => (
          <div key={index} className={`hero-slide ${index === currentSlide ? 'active' : ''}`} style={{ backgroundColor: slide.bg }}>
            <div className="hero-image-wrapper">
              <img src={slide.image} alt={slide.title} className="img-cover" style={{ objectPosition: 'center right' }} />
            </div>
            <div className="hero-content">
              <h1 className="text-hero" style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '16px', color: slide.color, lineHeight: '1.1' }}>
                {slide.title}
              </h1>
              <p style={{ fontSize: '20px', color: slide.color, opacity: 0.9, marginBottom: '32px' }}>
                {slide.subtitle}
              </p>
              <button 
                className="btn-gradient" 
                onClick={() => navigate(slide.link)} 
                style={{ padding: '16px 32px', fontSize: '16px', background: '#fff', color: '#000' }}
              >
                Shop Now <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ))}
        
        <div style={{ position: 'absolute', bottom: '30px', left: '0', width: '100%', display: 'flex', justifyContent: 'center', zIndex: 30 }}>
          {heroSlides.map((_, index) => (
            <div 
              key={index} 
              className={`hero-indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              style={{ background: index === currentSlide ? '#fff' : 'rgba(255,255,255,0.4)' }}
            />
          ))}
        </div>
      </section>

      {/* Flash Deals Section (Flipkart style) */}
      {deals.length > 0 && (
      <section className="container" style={{ marginBottom: '60px' }}>
        <div className="modern-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <h2 className="text-h2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Deals of the Day
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <span style={{ fontSize: '14px' }}>Ends in:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ background: 'var(--primary-color)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{String(timeLeft.h).padStart(2,'0')}</span>:
                  <span style={{ background: 'var(--primary-color)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{String(timeLeft.m).padStart(2,'0')}</span>:
                  <span style={{ background: 'var(--primary-color)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{String(timeLeft.s).padStart(2,'0')}</span>
                </div>
              </div>
            </div>
            <button className="btn-gradient" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => navigate('/products')}>View All Deals</button>
          </div>
          
          <div style={{ display: 'flex', overflowX: 'auto', gap: '24px', paddingBottom: '16px', scrollbarWidth: 'none' }}>
            {deals.map(item => (
              <div key={item.id} style={{ minWidth: '220px', maxWidth: '240px', cursor: 'pointer', textAlign: 'center' }} onClick={() => navigate(`/product/${item.id}`)}>
                <div style={{ height: '200px', padding: '24px', backgroundColor: '#fff', borderRadius: 'var(--radius-sm)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={item.image} alt={item.name} className="img-contain" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
                <div style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '18px' }}>Up to 40% Off</div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>{item.brand}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Category Grid Section */}
      <section className="container" style={{ marginBottom: '80px' }}>
        <h2 className="text-h2" style={{ marginBottom: '32px', textAlign: 'center' }}>Shop by Category</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {topCategories.map((cat, idx) => (
            <div key={idx} className="category-tile" onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}>
              <div className="category-bg" style={{ backgroundImage: `url(${cat.img})` }} />
              <div className="category-content">
                <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{cat.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Explore <ArrowRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <h2 className="text-h2">Featured Arrivals</h2>
          <button style={{ padding: '0', color: 'var(--primary-color)', background: 'transparent', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }} onClick={() => navigate('/products')}>
            View All →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
          {featured.map(item => (
            <div key={item.id} className="hover-card" onClick={() => navigate(`/product/${item.id}`)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ height: '240px', padding: '32px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={item.image} alt={item.name} className="img-contain" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="text-overline" style={{ color: 'var(--primary-color)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.brand}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', lineHeight: '1.5', color: 'var(--text-primary)' }}>{item.name}</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    ₹{item.price.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
