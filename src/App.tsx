import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import Saved from "./pages/Saved";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

// Feature Pages
import AiTourPlanner from "./pages/AiTourPlanner";
import PlacesList from "./pages/PlacesList";
import PlaceDetail from "./pages/PlaceDetail";
import HotelsList from "./pages/HotelsList";
import HotelDetail from "./pages/HotelDetail";
import RestaurantsList from "./pages/RestaurantsList";
import RestaurantDetail from "./pages/RestaurantDetail";
import EmergencyServices from "./pages/EmergencyServices";
import BanksList from "./pages/BanksList";
import TransportList from "./pages/TransportList";
import WarningZones from "./pages/WarningZones";
import BeachSafety from "./pages/BeachSafety";
import LiveNotices from "./pages/LiveNotices";
import Weather from "./pages/Weather";
import BeachChairs from "./pages/BeachChairs";
import AboutKuakata from "./pages/AboutKuakata";
import ComplaintForm from "./pages/ComplaintForm";
import BusCounters from "./pages/BusCounters";
import DcInitiatives from "./pages/DcInitiatives";
import TourOperators from "./pages/TourOperators";
import PopularFoods from "./pages/PopularFoods";
import ChildrenRides from "./pages/ChildrenRides";
import ShoppingMarkets from "./pages/ShoppingMarkets";

// Owner Dashboards
import HotelOwnerDashboard from "./pages/HotelOwnerDashboard";
import RestaurantOwnerDashboard from "./pages/RestaurantOwnerDashboard";
import RoomBooking from "./pages/RoomBooking";
import MyBookings from "./pages/MyBookings";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Main Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/admin" element={<AdminDashboard />} />
              
              {/* Owner Dashboards */}
              <Route path="/hotel-dashboard" element={<HotelOwnerDashboard />} />
              <Route path="/restaurant-dashboard" element={<RestaurantOwnerDashboard />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              
              {/* Feature Routes */}
              <Route path="/ai-planner" element={<AiTourPlanner />} />
              
              {/* Places */}
              <Route path="/places" element={<PlacesList />} />
              <Route path="/places/:id" element={<PlaceDetail />} />
              
              {/* Hotels */}
              <Route path="/hotels" element={<HotelsList />} />
              <Route path="/hotels/:id" element={<HotelDetail />} />
              <Route path="/hotels/:hotelId/book" element={<RoomBooking />} />
              
              {/* Restaurants */}
              <Route path="/restaurants" element={<RestaurantsList />} />
              <Route path="/restaurants/:id" element={<RestaurantDetail />} />
              
              {/* Other Features */}
              <Route path="/emergency" element={<EmergencyServices />} />
              <Route path="/banks" element={<BanksList />} />
              <Route path="/transport" element={<TransportList />} />
              <Route path="/warnings" element={<WarningZones />} />
              <Route path="/beach-safety" element={<BeachSafety />} />
              <Route path="/notices" element={<LiveNotices />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/beach-chairs" element={<BeachChairs />} />
              <Route path="/about-kuakata" element={<AboutKuakata />} />
              <Route path="/complaints" element={<ComplaintForm />} />
              <Route path="/bus-counters" element={<BusCounters />} />
              <Route path="/dc-initiatives" element={<DcInitiatives />} />
              <Route path="/tour-operators" element={<TourOperators />} />
              <Route path="/popular-foods" element={<PopularFoods />} />
              <Route path="/children-rides" element={<ChildrenRides />} />
              <Route path="/shopping-markets" element={<ShoppingMarkets />} />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
