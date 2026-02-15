import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Category from './pages/Category';
import OrderTracking from './pages/OrderTracking';
import Wishlist from './pages/Wishlist';
import Notifications from './pages/Notifications';
import MyOrders from './pages/MyOrders';
// PerfumeQuiz removed
import Settings from './pages/Settings';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import { requestFCMToken } from './firebase-config';
import Swal from 'sweetalert2';
import axios from 'axios';

function App() {
  useEffect(() => {
    // Register Firebase service worker with proper scope
    const registerFirebaseServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          // Check if service worker is already registered
          const existingRegistration = await navigator.serviceWorker.getRegistration('/');
          
          if (existingRegistration) {
            console.log('✅ Service Worker already registered:', existingRegistration);
          } else {
            // Register with explicit scope
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
              scope: '/'
            });
            console.log('✅ Firebase Service Worker registered:', registration);
          }
          
          // Wait for service worker to be active
          await navigator.serviceWorker.ready;
          console.log('✅ Service Worker is ready');
        } catch (error) {
          console.error('❌ Firebase Service Worker registration failed:', error);
        }
      }
    };
    
    registerFirebaseServiceWorker();
    
    // Listen for messages from service worker (notification clicks and new notifications)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 Message from service worker:', event.data);
        if (event.data.type === 'NOTIFICATION_CLICK' && event.data.url) {
          console.log('🔗 Navigating to:', event.data.url);
          window.location.href = event.data.url;
        } else if (event.data.type === 'NEW_NOTIFICATION') {
          // Trigger event to update notification badge
          window.dispatchEvent(new Event('newNotification'));
        }
      });
    }
    
    // Request notification permission after a short delay
    const requestNotifications = async () => {
      // Check if already asked
      const hasAsked = localStorage.getItem('notificationAsked');
      const isSubscribed = localStorage.getItem('notificationSubscribed');
      
      // Don't ask if already subscribed or already asked
      if (hasAsked || isSubscribed === 'true') {
        return;
      }
      
      // Wait 5 seconds after page load (give service worker time to register)
      setTimeout(async () => {
        const result = await Swal.fire({
          title: '🔔 Enable Notifications',
          html: `
            <p style="margin-bottom: 10px;">Get instant notifications for:</p>
            <ul style="text-align: left; list-style: none; padding: 0;">
              <li>✨ New products</li>
              <li>📦 Order updates</li>
              <li>🎁 Special offers</li>
            </ul>
          `,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Enable Notifications',
          cancelButtonText: 'Not Now',
          confirmButtonColor: '#000',
          cancelButtonColor: '#6b7280'
        });
        
        // Mark as asked
        localStorage.setItem('notificationAsked', 'true');
        
        if (result.isConfirmed) {
          const token = await requestFCMToken();
          
          if (token) {
            localStorage.setItem('notificationSubscribed', 'true');
            
            // Save token to database
            try {
              await axios.post('/api/orders/save-fcm-token', {
                token,
                userType: 'user'
              });
              console.log('✅ User token saved');
            } catch (error) {
              console.error('❌ Error saving token:', error);
            }
            
            Swal.fire({
              icon: 'success',
              title: 'Enabled!',
              text: 'You will receive notifications for updates',
              timer: 2000,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              icon: 'info',
              title: 'Not Enabled',
              text: 'You can enable notifications later from browser settings',
              confirmButtonColor: '#000'
            });
          }
        }
      }, 5000); // 5 seconds delay to ensure service worker is ready
    };
    
    requestNotifications();
  }, []);

  return (
    <CartProvider>
      <WishlistProvider>
        <Router>
          <div className="min-h-screen bg-beige-50">
            <Routes>
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/*" element={
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    {/* PerfumeQuiz route removed */}
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/category/:category" element={<Category />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-tracking" element={<OrderTracking />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/my-orders" element={<MyOrders />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                  <BottomNav />
                </>
              } />
            </Routes>
          </div>
        </Router>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;
