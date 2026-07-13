import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const EventsPage = () => {
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

  return (
    <div style={{ backgroundColor: '#F8F5F1', fontFamily: 'sans-serif', color: '#333', paddingBottom: '60px' }}>
      <Helmet><title>Event Planning &amp; Execution | Dani Declares LLC</title></Helmet>
      
      {/* Header Banner */}
      <div style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '38px', margin: '0 0 12px 0' }}>Event Planning &amp; Execution</h1>
        <p style={{ fontSize: '18px', maxWidth: '800px', margin: '0 auto 24px auto', lineHeight: '1.5', opacity: '0.9' }}>We don't just decorate. We plan, coordinate, and execute your entire event from start to finish.</p>
        <Link to="/request-service" style={{ backgroundColor: '#D4AF37', color: '#222', padding: '12px 24px', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block' }}>Request an Event Consultation</Link>
      </div>

      {/* Handles List */}
      <div style={{ padding: '50px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h3 style={{ textBreak: 'break-word', fontSize: '24px', color: '#8B1E2E', marginBottom: '24px', textAlign: 'center', borderBottom: '2px solid #ddd', paddingBottom: '12px' }}>Events We Handle</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {handlesItems.map((item) => (
            <div key={item} style={{ backgroundColor: '#fff', padding: '14px 20px', borderRadius: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', fontWeight: 'bold', borderLeft: '3px solid #8B1E2E' }}>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* What We Offer Grid */}
      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h3 style={{ textBreak: 'break-word', fontSize: '24px', color: '#222', marginBottom: '32px', textAlign: 'center' }}>What We Offer</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {offers.map((offer) => (
            <div key={offer.title} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h4 style={{ color: '#8B1E2E', margin: '0 0 10px 0', fontSize: '18px' }}>{offer.title}</h4>
              <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.5', margin: '0' }}>{offer.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Block */}
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Link to="/request-service" style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '14px 32px', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none', fontSize: '16px', display: 'inline-block' }}>Schedule Your Consultation Now</Link>
      </div>
    </div>
  );
};

export default EventsPage;