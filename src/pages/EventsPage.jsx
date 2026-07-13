import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const EventsPage = () => {
  const [currentIdx, setCurrentIdx] = useState(0);

  const handlesItems = [
    "Weddings (full planning)", "Wedding officiating", "Birthday parties",
    "Baby & bridal showers", "Children's parties", "Graduation celebrations",
    "Corporate & business events", "Community & church events", "Vow renewals",
    "Private dinners & celebrations", "Pop-up events", "Large-scale productions"
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

  const trueEventPhotos = [
    { src: "/images/weddings/wedding-ceremony-execution.jpg", label: "Wedding Ceremony Execution" },
    { src: "/images/weddings/lakefront-wedding-ceremony.jpg", label: "Lakefront Wedding Ceremony" },
    { src: "/images/weddings/wedding-couple.jpg", label: "Wedding Couple Celebration" },
    { src: "/images/weddings/event-venue-decor.jpg", label: "Event Venue Decor & Design" },
    { src: "/images/weddings/bridal-bouquet.jpg", label: "Bridal Bouquet Selection" },
    { src: "/images/weddings/reception-table-setup.jpg", label: "Reception Table Layout" }
  ];

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % trueEventPhotos.length);
    }, 4000);
    return () => clearInterval(slideTimer);
  }, [trueEventPhotos.length]);

  return (
    <div style={{ backgroundColor: '#F8F5F1', fontFamily: 'sans-serif', color: '#333', paddingBottom: '60px' }}>
      <Helmet><title>Event Planning &amp; Execution | Dani Declares LLC</title></Helmet>
      
      {/* Premium Header Banner */}
      <div style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '38px', margin: '0 0 12px 0' }}>Event Planning &amp; Execution</h1>
        <p style={{ fontSize: '18px', maxWidth: '800px', margin: '0 auto 24px auto', lineHeight: '1.5', opacity: '0.9' }}>We don't just decorate. We plan, coordinate, and execute your entire event from start to finish.</p>
        <a href="/request-service" style={{ backgroundColor: '#D4AF37', color: '#222', padding: '12px 24px', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block' }}>Request an Event Consultation</a>
      </div>

      {/* Restored Events We Handle Section */}
      <div style={{ padding: '50px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '24px', color: '#8B1E2E', marginBottom: '24px', textAlign: 'center', borderBottom: '2px solid #ddd', paddingBottom: '12px' }}>Events We Handle</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {handlesItems.map((item) => (
            <div key={item} style={{ backgroundColor: '#fff', padding: '14px 20px', borderRadius: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', fontWeight: 'bold', borderLeft: '3px solid #8B1E2E' }}>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Clickable Offers Grid */}
      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '24px', color: '#222', marginBottom: '12px', textAlign: 'center' }}>What We Offer</h3>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '32px' }}>Select any card below to launch an immediate service lane inquiry.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {offers.map((offer) => (
            <a 
              key={offer.title} 
              href="/request-service" 
              style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '6px', boxShadow: '0 3px 10px rgba(0,0,0,0.04)', textDecoration: 'none', color: 'inherit', display: 'block', borderLeft: '4px solid #8B1E2E', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
            >
              <h4 style={{ color: '#8B1E2E', margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>{offer.title}</h4>
              <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.5', margin: '0' }}>{offer.desc}</p>
              <span style={{ color: '#D4AF37', display: 'block', marginTop: '12px', fontSize: '13px', fontWeight: 'bold' }}>Select Service Lane &rarr;</span>
            </a>
          ))}
        </div>
      </div>

      {/* True Auto-Rotating Event Image Slider */}
      <div style={{ padding: '40px 20px', maxWidth: '750px', margin: '0 auto', textAlign: 'center' }}>
        <h3 style={{ fontSize: '24px', color: '#8B1E2E', marginBottom: '24px' }}>Our Work Gallery</h3>
        <div style={{ width: '100%', height: '440px', backgroundColor: '#222', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', position: 'relative' }}>
          <img 
            src={trueEventPhotos[currentIdx].src} 
            alt={trueEventPhotos[currentIdx].label} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            onError={(e) => { e.target.src = '/images/festival/festival-promo-gradient.jpg'; }}
          />
          <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', backgroundColor: 'rgba(139,30,46,0.9)', color: '#fff', padding: '14px', fontSize: '16px', fontWeight: 'bold' }}>
            {trueEventPhotos[currentIdx].label}
          </div>
        </div>
        
        {/* Carousel Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
          {trueEventPhotos.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrentIdx(idx)} 
              style={{ width: '10px', height: '10px', borderRadius: '50%', border: 'none', backgroundColor: currentIdx === idx ? '#8B1E2E' : '#ccc', cursor: 'pointer', padding: '0' }} 
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default EventsPage;