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
              
              {/* Feature Routes */}
              <Route path="/ai-planner" element={<AiTourPlanner />} />
              
              {/* Places */}
              <Route path="/places" element={<PlacesList />} />
              <Route path="/places/:id" element={<PlaceDetail />} />
              
              {/* Hotels */}
              <Route path="/hotels" element={<HotelsList />} />
              <Route path="/hotels/:id" element={<HotelDetail />} />
              
              {/* Restaurants */}
              <Route path="/restaurants" element={<RestaurantsList />} />
              <Route path="/restaurants/:id" element={<RestaurantDetail />} />
              
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
