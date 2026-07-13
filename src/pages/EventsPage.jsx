import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const EventsPage = () => {
  const navigate = useNavigate();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const handlesItems = [
    "Weddings (Full Planning)", "Wedding Officiating", "Birthday Parties", 
    "Baby & Bridal Showers", "Children's Parties", "Graduation Celebrations", 
    "Corporate & Business Events", "Community & Church Events", "Vow Renewals", 
    "Private Dinners & Celebrations", "Pop-Up Events", "Large-Scale Productions"
  ];

  const offers = [
    { title: "Full Wedding Planning", desc: "Complete wedding planning from concept to execution. Venue guidance, vendor sourcing, timeline creation, design direction, and full day-of management." },
    { title: "Wedding Officiating", desc: "Professional, personalized ceremony officiating. We work with you to create a ceremony that reflects your story and your style." },
    { title: "Event Planning & Coordination", desc: "Full planning support for parties, showers, corporate events, and celebrations. Budget planning, vendor coordination, and timeline management." },
    { title: "Day-Of Coordination", desc: "Already planned your event? We manage the day so you don't have to. Vendor point of contact, setup oversight, timeline execution, and problem-solving." },
    { title: "Balloon Arches & Custom Decor", desc: "Custom balloon installations, arches, backdrops, and themed decor. We design and install pieces that make your event stand out." },
    { title: "Setup & Breakdown", desc: "Full setup and breakdown service. We arrive early, execute the floor plan, manage vendor arrivals, and handle cleanup coordination." },
    { title: "Custom Event Production", desc: "Custom labels, stickers, favor tags, signage, seating charts, welcome signs, table numbers, and branded event details produced in-house." },
    { title: "Vendor Coordination", desc: "We source, communicate with, and coordinate all vendors so you have one point of contact from start to finish." }
  ];

  const libraryPhotos = [
    { src: "/images/festival/festival-promo-gradient.jpg", alt: "Wedding ceremony execution" },
    { src: "/images/stock/legal paperwork desk.jpg", alt: "Lakefront wedding ceremony" },
    { src: "/images/stock/mobile notary public workspace.jpg", alt: "Wedding couple celebration" },
    { src: "/images/stock/court building exterior.jpg", alt: "Event venue decor arrangements" },
    { src: "/images/products/renamed_merch_image.jpg", alt: "Bridal bouquet details" },
    { src: "/images/stock/file cabinet.jpg", alt: "Reception table setup design" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhotoIdx((prev) => (prev + 1) % libraryPhotos.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [libraryPhotos.length]);

  return (
    <div style={{ backgroundColor: '#F8F5F1', fontFamily: 'sans-serif', color: '#333', paddingBottom: '60px' }}>
      <Helmet><title>Event Planning &amp; Execution | Dani Declares LLC</title></Helmet>
      
      <div style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '38px', margin: '0 0 12px 0' }}>Event Planning &amp; Execution</h1>
        <p style={{ fontSize: '18px', maxWidth: '800px', margin: '0 auto 24px auto', lineHeight: '1.5', opacity: '0.9' }}>We plan, coordinate, and execute your entire event from start to finish.</p>
        <button onClick={() => navigate('/request-service')} style={{ backgroundColor: '#D4AF37', border: 'none', color: '#222', padding: '12px 24px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>Request an Event Consultation</button>
      </div>

      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '24px', color: '#222', marginBottom: '24px', textAlign: 'center' }}>What We Offer (Click Any Card to Book)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {offers.map((offer) => (
            <div key={offer.title} onClick={() => navigate('/request-service')} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'transform 0.2s', borderLeft: '4px solid #8B1E2E' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}>
              <h4 style={{ color: '#8B1E2E', margin: '0 0 10px 0', fontSize: '18px' }}>{offer.title}</h4>
              <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.5', margin: '0' }}>{offer.desc}</p>
              <span style={{ color: '#D4AF37', display: 'block', marginTop: '12px', fontSize: '13px', fontWeight: 'bold' }}>Click to select service lane &rarr;</span>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-Rotating Smooth Slider Section */}
      <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h3 style={{ fontSize: '24px', color: '#8B1E2E', marginBottom: '20px' }}>Our Work Gallery</h3>
        <div style={{ width: '100%', height: '450px', backgroundColor: '#333', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.1)', position: 'relative' }}>
          <img src={libraryPhotos[activePhotoIdx].src} alt={libraryPhotos[activePhotoIdx].alt} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.5s ease-in-out' }} />
          <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', padding: '16px', fontSize: '16px', fontWeight: 'bold' }}>
            {libraryPhotos[activePhotoIdx].alt}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
          {libraryPhotos.map((_, idx) => (
            <button key={idx} onClick={() => setActivePhotoIdx(idx)} style={{ width: '12px', height: '12px', borderRadius: '50%', border: 'none', backgroundColor: activePhotoIdx === idx ? '#8B1E2E' : '#ddd', cursor: 'pointer' }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;