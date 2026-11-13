import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { holidayBannerState } from './holidayBannerState';
import './HolidayCountdownBanner.css';

// Feature remains off unless explicitly enabled in an approved build configuration.
const countdownEnabled = process.env.REACT_APP_HOLIDAY_COUNTDOWN_ENABLED === 'true';

export default function HolidayCountdownBanner() {
  const [holiday, setHoliday] = useState(() => holidayBannerState());
  const [motion, setMotion] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => setHoliday(holidayBannerState()), 60000);
    return () => clearInterval(interval);
  }, []);
  if (holiday.phase === 'hidden') return null;
  const christmas = holiday.phase === 'christmas';
  return (
    <aside className="dani-holiday" aria-label="Holiday services">
      <div className="dani-holiday__inner">
        <div className="dani-holiday__copy">
          <span className="dani-holiday__eyebrow">DANI DECLARES / HOLIDAY 2026</span>
          <strong>{christmas ? 'Merry Christmas from DANI DECLARES.' : 'Make the holidays happen.'}</strong>
          <span>{christmas ? 'Wishing you a peaceful holiday.' : 'Decorating, home preparation and seasonal support.'}</span>
        </div>
        <div className="dani-holiday__actions">
          {!christmas && countdownEnabled && <span className="dani-holiday__days" aria-label={holiday.days + ' days until Christmas'}>{holiday.days} days to Christmas</span>}
          <Link to="/catalog" className="dani-holiday__cta">Explore services</Link>
          <button type="button" className="dani-holiday__motion" aria-pressed={motion} onClick={() => setMotion(!motion)}>
            {motion ? 'Stop snow' : 'Show snow'}
          </button>
        </div>
      </div>
      {motion && <div className="dani-holiday__snow" aria-hidden="true">{Array.from({length:12}, (_,i) => <span key={i}>{'\u2744'}</span>)}</div>}
    </aside>
  );
}
