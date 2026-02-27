import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import BookingPage from './pages/BookingPage';
import BookingConfirmPage from './pages/BookingConfirmPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminReserve from './pages/admin/AdminReserve';
import AdminOffers from './pages/admin/AdminOffers';
import AdminContacts from './pages/admin/AdminContacts';
import AdminMenu from './pages/admin/AdminMenu';
import AdminGallery from './pages/admin/AdminGallery';
import GalleryPage from './pages/GalleryPage';
import BookingLookupPage from './pages/BookingLookupPage';
import './index.css';

function ProtectedAdmin({ children }) {
  const token = localStorage.getItem('adminToken');
  if (!token) return <Navigate to="/admin" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public site */}
        <Route path="/" element={<><Navbar /><HomePage /><Footer /></>} />
        <Route path="/menu" element={<><Navbar /><MenuPage /><Footer /></>} />
        <Route path="/book" element={<><Navbar /><BookingPage /><Footer /></>} />
        <Route path="/booking/:id" element={<><Navbar /><BookingConfirmPage /><Footer /></>} />
        <Route path="/find-booking" element={<><Navbar /><BookingLookupPage /><Footer /></>} />
        <Route path="/gallery" element={<><Navbar /><GalleryPage /><Footer /></>} />
        <Route path="/about" element={<><Navbar /><AboutPage /><Footer /></>} />
        <Route path="/contact" element={<><Navbar /><ContactPage /><Footer /></>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/*" element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="reserve" element={<AdminReserve />} />
          <Route path="offers" element={<AdminOffers />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="gallery" element={<AdminGallery />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
