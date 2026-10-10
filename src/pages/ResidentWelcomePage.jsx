import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ResidentWelcomePage.css';

// Based on DANI's original Home Operations Task Library v1 (2026-10-08).
// Presentation only: no private household data is saved, transmitted or shared.
const TASKS = [
  { key: 'HOME-01', group: 'Weekly', name: 'Household review', help: 'Review the family calendar, supplies and task owners.' },
  { key: 'HOME-02', group: 'Weekly', name: 'Share responsibilities', help: 'Agree on safe, age-appropriate responsibilities.' },
  { key: 'HOME-03', group: 'Weekly', name: 'Check essentials', help: 'Review pantry, refrigerator, freezer and household staples.' },
  { key: 'HOME-04', group: 'Weekly', name: 'Plan flexible meals', help: 'Note meal ideas and what needs to be purchased.' },
  { key: 'HOME-05', group: 'Weekly', name: 'Choose a home focus', help: 'Prioritize a cleaning or organization area.' },
  { key: 'HOME-06', group: 'Monthly', name: 'Update the maintenance log', help: 'Record completed maintenance and what is due next.' },
  { key: 'HOME-07', group: 'Weekly', name: 'Review household routines', help: 'Update morning, evening and school-day routines.' },
  { key: 'HOME-08', group: 'As needed', name: 'Write a repeatable procedure', help: 'Document who does what, needed supplies and what finished means.' },
  { key: 'HOME-09', group: 'Seasonal', name: 'Review emergency contacts privately', help: 'Review your household reunification and contact plan offline.' },
  { key: 'HOME-10', group: 'Monthly', name: 'Review repeat decisions', help: 'Update default choices for familiar household tasks.' },
  { key: 'HOME-11', group: 'Monthly', name: 'Review household spending', help: 'Discuss the budget without entering banking information here.' },
  { key: 'HOME-12', group: 'Seasonal', name: 'Plan seasonal home upkeep', help: 'Identify inspections and qualified specialists as needed.' },
  { key: 'HOME-13', group: 'Weekly', name: 'Decide what to delegate', help: 'Separate do-it-yourself tasks from professional service needs.' },
  { key: 'HOME-14', group: 'Seasonal', name: 'Plan home resilience', help: 'Check supplies and consider gardening or preparedness projects.' },
];
const GROUPS = ['Weekly', 'Monthly', 'Seasonal', 'As needed'];
const FRONT_DOORS = [
  ['CH01-F01', 'Home Cleaning & Home Reset', 'Help making your space home-ready.'],
  ['CH01-F02', 'Household Concierge & Errands', 'Household coordination and practical support.'],
  ['CH01-F03', 'Pet & Plant Care', 'Routine pet and indoor plant support.'],
  ['CH01-F04', 'Home Watch & Away Support', 'Defined check-ins while you are away.'],
  ['CH01-F05', 'Move, Guest & Seasonal Support', 'Support during transitions, hosting and seasonal work.'],
];

export default function ResidentWelcomePage() {
  const [checked, setChecked] = useState({});
  const [activeGroup, setActiveGroup] = useState('Weekly');
  const [showAll, setShowAll] = useState(false);
  const complete = TASKS.filter(task => checked[task.key]).length;
  const displayed = showAll ? TASKS : TASKS.filter(task => task.group === activeGroup);
  return <main className="dani-home-operations">
    <section className="dho-hero">
      <div className="dho-width">
        <p className="dho-eyebrow">DANI DECLARES · HOME OPERATIONS</p>
        <h1>Less to remember. More gets handled.</h1>
        <p className="dho-intro">Put your household routines, upcoming tasks and service needs in one manageable place. Start with a free planning checklist, then ask DANI for help when you want something professionally handled.</p>
        <div className="dho-actions">
          <a href="#starter" className="dho-button dho-button-primary">Start your household plan</a>
          <Link className="dho-button dho-button-outline" to="/request-service?channelType=B2C&frontDoor=CH01-F02">Request household support</Link>
        </div>
      </div>
    </section>
    <div className="dho-width">
      <section id="starter" className="dho-starter" aria-labelledby="starter-title">
        <div className="dho-heading">
          <div><p className="dho-eyebrow">YOUR FREE STARTER</p><h2 id="starter-title">Home Operations Checklist</h2><p>Four simple planning rhythms. Check items as you work through them, or print a copy for your household.</p></div>
          <div className="dho-progress" role="status" aria-live="polite"><strong>{complete} / {TASKS.length}</strong><span>Checked in this session</span></div>
        </div>
        <div className="dho-disclosure">Your checkmarks stay in this browser session only. This page does not save your household information, collect family details or create a service request.</div>
        <div className="dho-filters" role="group" aria-label="Choose planning rhythm">
          {GROUPS.map(group => <button key={group} type="button" aria-pressed={!showAll && activeGroup === group} className={!showAll && activeGroup === group ? 'is-active' : ''} onClick={() => { setActiveGroup(group); setShowAll(false); }}>{group}</button>)}
          <button type="button" aria-pressed={showAll} className={showAll ? 'is-active' : ''} onClick={() => setShowAll(true)}>All tasks</button>
        </div>
        <ul className="dho-task-list">
          {displayed.map(task => <li key={task.key}>
            <label><input type="checkbox" checked={Boolean(checked[task.key])} onChange={event => setChecked(current => ({ ...current, [task.key]: event.target.checked }))} />
              <span><strong>{task.name}</strong><small>{task.help}</small></span>
            </label>
            <span className="dho-task-frequency">{task.group}</span>
          </li>)}
        </ul>
        <div className="dho-starter-actions">
          <button type="button" className="dho-button dho-button-primary" onClick={() => window.print()}>Print my checklist</button>
          <button type="button" className="dho-button dho-button-text" onClick={() => setChecked({})}>Clear checkmarks</button>
        </div>
      </section>
      <section className="dho-services" aria-labelledby="services-title">
        <p className="dho-eyebrow">NEED AN EXTRA SET OF HANDS?</p>
        <h2 id="services-title">Plan it yourself. Let DANI handle what needs support.</h2>
        <p>This is a planning tool, not a purchase or a booking. If you want help, choose a starting point. DANI confirms your needs and applicable approved services before presenting a quote.</p>
        <div className="dho-service-grid">
          {FRONT_DOORS.map(([code,title,description]) => <article key={code}>
            <h3>{title}</h3><p>{description}</p>
            <Link to={`/request-service?channelType=B2C&frontDoor=${encodeURIComponent(code)}`}>Discuss this service <span aria-hidden="true">→</span></Link>
          </article>)}
        </div>
      </section>
      <section className="dho-next" aria-labelledby="next-title">
        <div><p className="dho-eyebrow">WHAT HAPPENS NEXT</p><h2 id="next-title">From a household need to a handled result.</h2></div>
        <ol><li><strong>Plan.</strong> Organize your own routines and tasks.</li><li><strong>Ask.</strong> Choose to send DANI a service request.</li><li><strong>Confirm.</strong> DANI reviews scope, pricing and availability.</li><li><strong>Execute.</strong> Approved work follows the existing assignment and quality process.</li></ol>
        <p>Some maintenance requires licensed specialists. DANI only offers work covered by its verified service scope and qualified providers.</p>
      </section>
    </div>
  </main>;
}
