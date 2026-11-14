import React from 'react';
import { Link } from 'react-router-dom';
import { getFamilyVisuals, getServiceVisuals } from '../data/serviceVisuals2026.js';
import './ServiceAreaLanding.css';

/**
 * Public service-area presentation only. Commercial scope and availability
 * continue through the existing catalog and request/quote governance.
 */
export default function ServiceAreaLanding({
  eyebrow, title, description, visualFamily, visualService, cards, firstAction, secondAction,
  sectionTitle = 'Choose where you need support',
  sectionDescription = 'Start with the outcome you need. DANI will confirm the scope and the appropriate next step.',
  closingTitle = 'Tell DANI what needs to get done.',
  closingDescription = 'Describe the situation, location and timing. We will review the available options before making any commitment.',
}) {
  const image = visualService ? getServiceVisuals('11', visualService)?.[0] : getFamilyVisuals(visualFamily)?.[0];
  const renderAction = (action, className) => !action ? null : action.href
    ? <a className={className} href={action.href}>{action.label}</a>
    : <Link className={className} to={action.to}>{action.label}</Link>;
  return (
    <div className="dd-service-landing">
      <section className="dd-service-landing__hero" aria-labelledby="dd-service-title">
        <div className="dd-service-landing__inner dd-service-landing__hero-grid">
          <div className="dd-service-landing__copy">
            <p className="dd-service-landing__eyebrow">{eyebrow}</p>
            <h1 id="dd-service-title">{title}</h1>
            <p className="dd-service-landing__intro">{description}</p>
            <div className="dd-service-landing__actions">
              {renderAction(firstAction, 'dd-service-landing__button dd-service-landing__button--gold')}
              {renderAction(secondAction, 'dd-service-landing__button dd-service-landing__button--ghost')}
            </div>
          </div>
          {image?.imageUrl && <figure className="dd-service-landing__figure">
            <img src={image.imageUrl} alt={image.altText || 'Illustrative service setting'} loading="eager" />
            <figcaption>Illustrative service photography.</figcaption>
          </figure>}
        </div>
      </section>
      <section className="dd-service-landing__content dd-service-landing__inner" aria-labelledby="dd-service-options-title">
        <p className="dd-service-landing__section-label">Explore how we can help</p>
        <h2 id="dd-service-options-title">{sectionTitle}</h2>
        <p className="dd-service-landing__section-intro">{sectionDescription}</p>
        <div className="dd-service-landing__cards">
          {cards.map(card => <article key={card.title} className="dd-service-landing__card">
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            {Array.isArray(card.items) && <ul>{card.items.map(item => <li key={item}>{item}</li>)}</ul>}
            {card.to && <Link className="dd-service-landing__card-link" to={card.to}>{card.linkLabel || 'Explore this service'} <span aria-hidden="true">→</span></Link>}
          </article>)}
        </div>
        <aside className="dd-service-landing__closing">
          <div>
            <p className="dd-service-landing__section-label">Your next step</p>
            <h2>{closingTitle}</h2>
            <p>{closingDescription}</p>
          </div>
          <div className="dd-service-landing__closing-actions">
            {renderAction(firstAction, 'dd-service-landing__button dd-service-landing__button--gold')}
            <Link className="dd-service-landing__button dd-service-landing__button--outline" to="/catalog">Explore all services</Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
