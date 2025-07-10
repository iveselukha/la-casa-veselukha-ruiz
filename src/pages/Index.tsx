import { useState } from "react";
import { Hero } from "@/components/Hero";
import { RoomAvailability } from "@/components/RoomAvailability";
import { BookingModal } from "@/components/BookingModal";
import { AdminPanel } from "@/components/AdminPanel";
import { AdminAuth } from "@/components/AdminAuth";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const Index = () => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAdminClick = () => {
    if (isAuthenticated) {
      setShowAdmin(!showAdmin);
    } else {
      setShowAdmin(true);
    }
  };

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleCloseAdmin = () => {
    setShowAdmin(false);
    // Keep authentication state so user doesn't need to re-enter password
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-sage-50 rustic-texture">
      {/* Admin Toggle - Hidden in top corner */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAdminClick}
          className="opacity-30 hover:opacity-100 transition-opacity"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {showAdmin ? (
        isAuthenticated ? (
          <AdminPanel onClose={handleCloseAdmin} />
        ) : (
          <AdminAuth onAuthenticated={handleAuthenticated} />
        )
      ) : (
        <>
          <Hero />
          <RoomAvailability onBookRoom={setSelectedRoom} />
          
          {selectedRoom && (
            <BookingModal
              roomId={selectedRoom}
              onClose={() => setSelectedRoom(null)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Index;
