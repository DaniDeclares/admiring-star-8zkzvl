import CoachingPage from "./pages/CoachingPage.jsx"; // or any other safe, working page

export default function App() {
  return (
    <>
      <FestivalBanner />
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/coaching" element={<CoachingPage />} />
        <Route path="/" element={<div style={{ padding: '2rem' }}>TEST CONTENT: Home route is working ✅</div>} />
      </Routes>
      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}
