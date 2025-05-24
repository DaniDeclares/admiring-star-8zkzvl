import CoachingPage from "./pages/CoachingPage.jsx"; // or any other safe, working page

export default function App() {
  return (
    <>
      <FestivalBanner />
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/coaching" element={<CoachingPage />} />
      </Routes>
      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}
