import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center text-[#8B1E2E] font-serif">
      <div className="text-2xl font-bold">Dani Declares</div>
      <div className="flex space-x-4 text-lg">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/weddings" className="hover:underline">Weddings</Link>
        <Link to="/calendar" className="hover:underline">Calendar</Link>
        <Link to="/coaching" className="hover:underline">Coaching</Link>
      </div>
    </nav>
  );
}
