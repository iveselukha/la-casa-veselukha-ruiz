
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Bed, Bath } from "lucide-react";
import { RoomCalendar } from "@/components/ui/room-calendar";
import { addDays, format, isSameDay, parseISO } from "date-fns";
import { getAllBookings, Booking } from "@/lib/bookingService";
import { BookingModal } from "@/components/BookingModal";
import { loadRoomSettings, RoomSettings } from "@/lib/roomSettingsService";

interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  bookingEnabled: boolean;
}

interface RoomAvailabilityProps {
  onBookRoom: (roomId: string) => void;
}

export const RoomAvailability = ({ onBookRoom }: RoomAvailabilityProps) => {
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "room-1",
      name: "Room Uno",
      description: "Master bedroom",
      capacity: 2,
      bookingEnabled: true,
    },
    {
      id: "room-2", 
      name: "Room Dos",
      description: "Guest bedroom",
      capacity: 2,
      bookingEnabled: true,
    },
    {
      id: "room-3",
      name: "El Sofá",
      description: "Sofa muy comfortable",
      capacity: 2,
      bookingEnabled: true,
    }
  ]);

  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [roomSettings, setRoomSettings] = useState<RoomSettings>(loadRoomSettings());

  // Load real bookings from Firebase
  const loadBookings = async () => {
    try {
      setLoading(true);
      const bookings = await getAllBookings();
      setAllBookings(bookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // Refresh bookings every 30 seconds to keep calendar updated
  useEffect(() => {
    const interval = setInterval(() => {
      loadBookings();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Listen for room settings changes
  useEffect(() => {
    const handleStorageChange = () => {
      setRoomSettings(loadRoomSettings());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Convert real bookings to calendar format
  const getRoomBookings = (roomId: string) => {
    // Only consider bookings that are not cancelled
    const roomBookings = allBookings.filter(
      booking => booking.roomId === roomId && booking.status !== 'cancelled'
    );
    
    // Create calendar data for the next 2 years (730 days)
    const calendarData = [];
    const today = new Date();
    
    for (let i = 0; i < 730; i++) {
      const date = addDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Check if there's a booking for this date
      const bookingForDate = roomBookings.find(booking => {
        const checkInDate = booking.checkIn instanceof Date ? booking.checkIn : booking.checkIn.toDate();
        const checkOutDate = booking.checkOut instanceof Date ? booking.checkOut : booking.checkOut.toDate();
        const checkIn = format(checkInDate, 'yyyy-MM-dd');
        const checkOut = format(checkOutDate, 'yyyy-MM-dd');
        const currentDate = format(date, 'yyyy-MM-dd');
        
        return currentDate >= checkIn && currentDate < checkOut;
      });

      if (bookingForDate) {
        calendarData.push({
          date,
          status: bookingForDate.status === 'confirmed' ? 'booked' : 'pending',
          roomId,
          guestName: bookingForDate.guestName
        });
      } else {
        calendarData.push({
          date,
          status: 'available'
        });
      }
    }
    
    return calendarData;
  };

  // Check if dates are available for booking
  const areDatesAvailable = (roomId: string, checkIn: string, checkOut: string) => {
    const roomBookings = allBookings.filter(booking => booking.roomId === roomId);
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    // Check if any confirmed booking overlaps with the requested dates
    const hasConflict = roomBookings.some(booking => {
      if (booking.status !== 'confirmed') return false;
      
      const bookingCheckIn = booking.checkIn instanceof Date ? booking.checkIn : booking.checkIn.toDate();
      const bookingCheckOut = booking.checkOut instanceof Date ? booking.checkOut : booking.checkOut.toDate();
      
      // Check for overlap
      return (
        (checkInDate >= bookingCheckIn && checkInDate < bookingCheckOut) ||
        (checkOutDate > bookingCheckIn && checkOutDate <= bookingCheckOut) ||
        (checkInDate <= bookingCheckIn && checkOutDate >= bookingCheckOut)
      );
    });
    
    return !hasConflict;
  };

  return (
    <section id="rooms-section" className="py-4 px-4 fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-8 fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-semibold text-terracotta-800 mb-3 sm:mb-4">
            Our Spaces
          </h2>
        </div>

        <div className="space-y-8 sm:space-y-12">
          {rooms.map((room) => {
            const isEnabled = roomSettings[room.id as keyof RoomSettings]?.enabled ?? true;
            return (
            <div key={room.id} className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 items-stretch fade-in">
              {showBookingModal && selectedRoomId === room.id && (
                <BookingModal
                  roomId={room.id}
                  onClose={() => setShowBookingModal(false)}
                  onBookingSuccess={loadBookings}
                />
              )}
              {/* Room Details */}
              <Card className="col-span-1 lg:col-span-2 premium-shadow hover:shadow-lg transition-all duration-300 border-sage-200 bg-white/80 backdrop-blur-sm room-card-animate">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <CardTitle className="text-2xl sm:text-3xl font-playfair text-terracotta-700">
                      {room.name}
                    </CardTitle>
                    <Badge 
                      variant="default"
                      className={`text-xs sm:text-sm ${isEnabled ? "bg-sage-600 text-white" : "bg-gray-400 text-white"}`}
                    >
                      {isEnabled ? "Available for Booking" : "Booking for this period is not yet enabled"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
  <p className="text-sage-600 leading-relaxed text-lg mb-6">
    {room.description}
  </p>
  
  {/* Placeholder photos */}
  <div className="grid grid-cols-2 gap-4 mb-6">
    <div className="aspect-video bg-sage-100 rounded-lg flex items-center justify-center border-2 border-dashed border-sage-300">
      <span className="text-sage-500 text-sm text-center px-2">Room Photo 1 Pending</span>
    </div>
    <div className="aspect-video bg-sage-100 rounded-lg flex items-center justify-center border-2 border-dashed border-sage-300">
      <span className="text-sage-500 text-sm text-center px-2">Room Photo 2 Pending</span>
    </div>
  </div>
  
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sage-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Bed className="w-5 h-5" />
                      <span>Sleeps {room.capacity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span>{room.id === "room-3" ? "Shared space" : "Private room"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="w-5 h-5" />
                      <span>{room.id === "room-1" ? "En suite" : "Shared bathroom"}</span>
                    </div>
                  </div>

  <Button
    onClick={() => {
      setSelectedRoomId(room.id);
      setShowBookingModal(true);
    }}
    disabled={!isEnabled}
    className={`w-full animated-btn ${
      isEnabled
        ? "bg-terracotta-600 hover:bg-terracotta-700 text-white"
        : "bg-sage-200 text-sage-500 cursor-not-allowed"
    } transition-all duration-200`}
  >
    <Calendar className="w-5 h-5 mr-2" />
    {isEnabled 
      ? "Request Booking" 
      : "Booking for this period is not yet enabled, please try again later"
    }
  </Button>
</CardContent>
              </Card>

              {/* Room Calendar */}
              <Card className="col-span-1 lg:col-span-1 premium-shadow border-sage-200 bg-white/80 backdrop-blur-sm room-card-animate">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div>
                      <CardTitle className="text-lg sm:text-xl font-playfair text-terracotta-700">
                        {room.name} Availability
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-sage-600">
                        View availability and book your preferred dates
                      </p>
                    </div>
                    <Button
                      onClick={loadBookings}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <RoomCalendar 
                    bookings={getRoomBookings(room.id)}
                    showLegend={true}
                  />
                </CardContent>
              </Card>
            </div>
          );
          })}
        </div>
      </div>
    </section>
  );
};
