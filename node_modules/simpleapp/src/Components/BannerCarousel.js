import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BannerCarousel = () => {
  const [currentIdx, setCurrentIdx] = useState(0);

  const banners = [
    { id: 1, img: "https://rukminim2.flixcart.com/fk-p-flap/1600/270/image/d9290fb51138d286.png?q=20", alt: "Sale 1" },
    { id: 2, img: "https://rukminim2.flixcart.com/fk-p-flap/1600/270/image/348b111db0af5473.png?q=20", alt: "Sale 2" },
    { id: 3, img: "https://rukminim2.flixcart.com/fk-p-flap/1600/270/image/bd61eef64ecde16c.jpg?q=20", alt: "Sale 3" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => setCurrentIdx((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentIdx((prev) => (prev === 0 ? banners.length - 1 : prev - 1));

  return (
    <div style={{ position: 'relative', width: '100%', height: '280px', marginBottom: '15px', overflow: 'hidden', backgroundColor: '#e2f0ff' }}>
      
      {/* Images Container */}
      <div style={{ 
        display: 'flex', 
        width: `${banners.length * 100}%`,
        height: '100%',
        transform: `translateX(-${(currentIdx * 100) / banners.length}%)`,
        transition: 'transform 0.5s ease-in-out'
      }}>
        {banners.map((banner) => (
          <div key={banner.id} style={{ width: `${100 / banners.length}%`, height: '100%', flexShrink: 0 }}>
             <img src={banner.img} alt={banner.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button 
        onClick={prevSlide}
        style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          backgroundColor: 'rgba(255,255,255,0.8)', border: 'none', padding: '30px 10px',
          cursor: 'pointer', borderTopRightRadius: '4px', borderBottomRightRadius: '4px',
          boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
        }}
      >
        <ChevronLeft size={30} />
      </button>

      <button 
        onClick={nextSlide}
        style={{
          position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
          backgroundColor: 'rgba(255,255,255,0.8)', border: 'none', padding: '30px 10px',
          cursor: 'pointer', borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px',
          boxShadow: '-2px 0 4px rgba(0,0,0,0.1)'
        }}
      >
        <ChevronRight size={30} />
      </button>

    </div>
  );
};

export default BannerCarousel;
