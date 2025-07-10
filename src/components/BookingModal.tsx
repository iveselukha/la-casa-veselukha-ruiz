
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Users, Mail, Phone, MessageSquare } from "lucide-react";
import { saveBooking, BookingFormData, getAllBookings, Booking } from "@/lib/bookingService";

interface BookingModalProps {
  roomId: string;
  onClose: () => void;
  onBookingSuccess?: () => void;
}

export const BookingModal = ({ roomId, onClose, onBookingSuccess }: BookingModalProps) => {
  const [formData, setFormData] = useState({
    guestName: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: "1",
    message: ""
  });

  const getRoomName = (id: string) => {
    if (id === "room-1") return "Room Uno";
    if (id === "room-2") return "Room Dos";
    if (id === "room-3") return "El Sofa";
    return "Unknown Room";
  };

  const getRoomDescription = (id: string) => {
    if (id === "room-1") return "Master bedroom";
    if (id === "room-2") return "Guest bedroom";
    if (id === "room-3") return "Comfortable sofa bed in the living room";
    return "Unknown room";
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate dates first
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      
      if (checkInDate >= checkOutDate) {
        alert("Please select a check-out date that is after your check-in date.");
        setIsSubmitting(false);
        return;
      }
      
      // Check for double booking
      const allBookings = await getAllBookings();
      const roomBookings = allBookings.filter(booking => booking.roomId === roomId);
      
      // Check if any confirmed booking overlaps with the requested dates
      const hasConflict = roomBookings.some(booking => {
        if (booking.status !== 'confirmed') return false;
        
        const bookingCheckIn = new Date(booking.checkIn);
        const bookingCheckOut = new Date(booking.checkOut);
        
        // Check for overlap
        return (
          (checkInDate >= bookingCheckIn && checkInDate < bookingCheckOut) ||
          (checkOutDate > bookingCheckIn && checkOutDate <= bookingCheckOut) ||
          (checkInDate <= bookingCheckIn && checkOutDate >= bookingCheckOut)
        );
      });
      
      if (hasConflict) {
        alert("Sorry, these dates are already booked. Please select different dates.");
        setIsSubmitting(false);
        return;
      }

      const bookingData: BookingFormData = {
        roomId,
        roomName: getRoomName(roomId),
        guestName: formData.guestName,
        guestEmail: formData.email,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: parseInt(formData.guests),
        message: formData.message || undefined,
      };

      await saveBooking(bookingData);
      alert("Booking request submitted successfully! We'll get back to you soon.");
      onBookingSuccess?.(); // Refresh the calendar
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      alert("Sorry, there was an error submitting your booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-sage-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair text-terracotta-700">
            Book {getRoomName(roomId)}
          </DialogTitle>
          <p className="text-sage-600">{getRoomDescription(roomId)}</p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guestName" className="text-sage-700">Guest Name(s)</Label>
            <Input
              id="guestName"
              value={formData.guestName}
              onChange={(e) => handleInputChange("guestName", e.target.value)}
              className="border-sage-300 focus:border-terracotta-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sage-700 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="border-sage-300 focus:border-terracotta-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sage-700 flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="border-sage-300 focus:border-terracotta-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn" className="text-sage-700 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Check-in
              </Label>
              <Input
                id="checkIn"
                type="date"
                value={formData.checkIn}
                onChange={(e) => handleInputChange("checkIn", e.target.value)}
                className="border-sage-300 focus:border-terracotta-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="checkOut" className="text-sage-700 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Check-out
              </Label>
              <Input
                id="checkOut"
                type="date"
                value={formData.checkOut}
                onChange={(e) => handleInputChange("checkOut", e.target.value)}
                className="border-sage-300 focus:border-terracotta-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guests" className="text-sage-700 flex items-center gap-1">
              <Users className="w-4 h-4" />
              Number of Guests
            </Label>
            <select
              id="guests"
              value={formData.guests}
              onChange={(e) => handleInputChange("guests", e.target.value)}
              className="w-full p-2 border border-sage-300 rounded-md focus:border-terracotta-500 focus:outline-none"
              required
            >
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sage-700 flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              className="border-sage-300 focus:border-terracotta-500"
              placeholder="Any special requests or questions?"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-sage-300 text-sage-600 hover:bg-sage-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-terracotta-600 hover:bg-terracotta-700 text-white disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
