import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './HolidayCountdownBanner.css';

const target = new Date('2026-12-25T00:00:00-05:00').getTime();
function daysRemaining() {
  return Math.max(0, Math.ceil((target - Date.now()) / 86400000));
}
export default function HolidayCountdownBanner() {
  const [days, setDays] = useState(daysRemaining);
  const [motion, setMotion] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => setDays(daysRemaining()), 60000);
    return () => clearInterval(interval);
  }, []);
  if (days === 0) return null;
  return (
    <aside className="dani-holiday" aria-label="Holiday services">
      <div className="dani-holiday__inner">
        <div className="dani-holiday__copy">
          <span className="dani-holiday__eyebrow">DANI DECLARES · HOLIDAY 2026</span>
          <strong>Make the holidays happen.</strong>
          <span>Decorating, home preparation and seasonal support.</span>
        </div>
        <div className="dani-holiday__actions">
          <span className="dani-holiday__days" aria-label={days + ' days until Christmas'}>{days} days to Christmas</span>
          <Link to="/catalog?audience=residents" className="dani-holiday__cta">Explore holiday services</Link>
          <button type="button" className="dani-holiday__motion" aria-pressed={motion} onClick={() => setMotion(!motion)}>
            {motion ? 'Stop snow' : 'Show snow'}
          </button>
        </div>
      </div>
      {motion && <div className="dani-holiday__snow" aria-hidden="true">{Array.from({length:12}, (_,i) => <span key={i}>❄</span>)}</div>}
    </aside>
  );
}
