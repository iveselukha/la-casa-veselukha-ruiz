
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface BookingDate {
  date: Date;
  status: 'available' | 'booked' | 'pending';
  roomId?: string;
  guestName?: string;
}

interface RoomCalendarProps {
  bookings: BookingDate[];
  onDateSelect?: (date: Date) => void;
  showLegend?: boolean;
  className?: string;
}

export const RoomCalendar = ({ bookings, onDateSelect, showLegend = true, className }: RoomCalendarProps) => {
  const getDateStatus = (date: Date) => {
    const booking = bookings.find(b => 
      format(b.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    return booking?.status || 'available';
  };

  const getDateBooking = (date: Date) => {
    return bookings.find(b => 
      format(b.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const modifiers = {
    available: bookings.filter(b => b.status === 'available').map(b => b.date),
    booked: bookings.filter(b => b.status === 'booked').map(b => b.date),
    pending: bookings.filter(b => b.status === 'pending').map(b => b.date),
  };

  const modifiersClassNames = {
    available: "bg-sage-100 text-sage-800 hover:bg-sage-200",
    booked: "bg-terracotta-500 text-white hover:bg-terracotta-600",
    pending: "bg-amber-500 text-white hover:bg-amber-600",
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Calendar
        mode="single"
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        onSelect={onDateSelect}
        className="rounded-md border border-sage-200 premium-shadow bg-white/80"
        classNames={{
          day_today: "bg-sage-100 text-sage-800 font-semibold",
        }}
      />
      
      {showLegend && (
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sage-200"></div>
            <span className="text-sage-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-terracotta-500"></div>
            <span className="text-sage-600">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-sage-600">Pending</span>
          </div>
        </div>
      )}
    </div>
  );
};
