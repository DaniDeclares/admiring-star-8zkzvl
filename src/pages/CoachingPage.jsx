import React from "react";
import { Helmet } from "react-helmet-async";
import HubSpotForm from "../components/HubSpotForm.jsx";
import "./CoachingPage.css";

const PACKAGES = [
	{
		name: "Discovery Session",
		duration: "30 mins",
		price: 99,
		bookUrl: "https://tidycal.com/danideclaresns/discovery-session",
	},
	{
		name: "1:1 Coaching",
		duration: "4 sessions (1 hr each)",
		price: 499,
		bookUrl: "https://tidycal.com/danideclaresns/one-on-one-coaching",
	},
	{
		name: "VIP Intensive",
		duration: "6 hrs",
		price: 1200,
		bookUrl: "https://tidycal.com/danideclaresns/vip-intensive",
	},
];

export default function CoachingPage() {
	return (
		<main className="coaching-page">
			<Helmet>
				<title>Coaching • Dani Declares</title>
				<meta
					name="description"
					content="Book a session with Dani to unlock confidence, cash flow, and clarity."
				/>
			</Helmet>

			<header className="coaching-hero">
				<h1>Ready to Declare Your Worth?</h1>
				<p>
					Let’s build the clarity, confidence, and cash flow you’ve been
					waiting for.
				</p>
				<a
					href="https://tidycal.com/danideclaresns"
					target="_blank"
					rel="noopener noreferrer"
					className="btn btn--primary"
				>
					Book Your Free Coaching Intro
				</a>
			</header>

			<section className="testimonials">
				<h2>Client Breakthroughs</h2>
				<div className="carousel">
					{[
						{
							name: "Alex P.",
							text: "Dani helped me unlock my power and profit — I’m finally building the life I want.",
						},
						{
							name: "Morgan S.",
							text: "I gained so much clarity and confidence. My business is thriving!",
						},
						{
							name: "Jamie L.",
							text: "The mindset shifts I experienced with Dani were game-changing.",
						},
						{
							name: "Taylor R.",
							text: "I left every session with a clear plan and renewed motivation.",
						},
						{
							name: "Jordan K.",
							text: "Dani’s coaching gave me the push I needed to take action.",
						},
						{
							name: "Casey M.",
							text: "I finally feel in control of my growth and direction.",
						},
					].map((client, idx) => (
						<div key={idx} className="carousel-item">
							<div
								className="testimonial-avatar"
								aria-label={`Avatar for ${client.name}`}
							>
								<span>
									{client.name
										.split(" ")
										.map((n) => n[0])
										.join("")}
								</span>
							</div>
							<p>“{client.text}”</p>
							<span>— {client.name}</span>
						</div>
					))}
				</div>
			</section>

			<section className="packages">
				<h2>Coaching Options</h2>
				<div className="packages-grid">
					{PACKAGES.map((p) => (
						<div key={p.name} className="package-card">
							<h3>{p.name}</h3>
							<p className="meta">
								{p.duration} &nbsp;•&nbsp; <strong>${p.price}</strong>
							</p>
							<a
								href={p.bookUrl}
								className="btn btn--primary"
								target="_blank"
								rel="noopener noreferrer"
							>
								Book Now
							</a>
						</div>
					))}
				</div>
			</section>

			<section className="benefits">
				<h2>What You’ll Gain</h2>
				<ul>
					<li>💡 Clarity on your next steps</li>
					<li>📈 A personalized growth strategy</li>
					<li>🎯 Accountability and support</li>
					<li>💬 Real-time mindset shifts</li>
				</ul>
			</section>

			<section className="coaching-contact">
				<h2>Still Have Questions?</h2>
				<p>
					Drop your email and we’ll follow up with a personalized response:
				</p>
				<HubSpotForm />
			</section>

			<section className="coaching-session">
				<h2>Power Coaching Session</h2>
				<p>
					One-on-one breakthrough coaching session with Dani Declares. Get
					clarity, strategy, and momentum for your next big move.
				</p>
				<a
					href="https://buy.stripe.com/aFa5kC9q18CW2LBb9f6kg01"
					className="btn btn--primary"
					target="_blank"
					rel="noopener noreferrer"
				>
					Book Power Coaching Session
				</a>
			</section>

			<section className="coaching-payment-flow">
				<h2>Book Your Power Coaching Session</h2>
				<ol>
					<li>
						<strong>Step 1:</strong>{" "}
						<a
							href="https://buy.stripe.com/your-payment-link"
							className="btn btn--primary"
							target="_blank"
							rel="noopener noreferrer"
						>
							Pay Now
						</a>
					</li>
					<li style={{ marginTop: "1rem" }}>
						<strong>Step 2:</strong> After payment, you’ll be redirected to{" "}
						<a
							href="https://calendly.com/danideclaresns"
							target="_blank"
							rel="noopener noreferrer"
						>
							book your session
						</a>
						.
					</li>
				</ol>
			</section>
		</main>
	);
}
