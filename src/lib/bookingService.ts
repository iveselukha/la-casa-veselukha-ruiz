import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  Timestamp,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';

export interface Booking {
  id?: string;
  roomId: string;
  roomName: string;
  guestName: string;
  guestEmail: string;
  checkIn: Date | Timestamp;
  checkOut: Date | Timestamp;
  guests: number;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date | Timestamp;
  totalPrice?: number;
}

export interface BookingFormData {
  roomId: string;
  roomName: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  message?: string;
}

// Save a new booking
export const saveBooking = async (bookingData: BookingFormData): Promise<string> => {
  try {
    // Only include message if it exists
    const booking: any = {
      roomId: bookingData.roomId,
      roomName: bookingData.roomName,
      guestName: bookingData.guestName,
      guestEmail: bookingData.guestEmail,
      checkIn: Timestamp.fromDate(new Date(bookingData.checkIn)),
      checkOut: Timestamp.fromDate(new Date(bookingData.checkOut)),
      guests: bookingData.guests,
      status: 'pending' as const,
      createdAt: Timestamp.now(),
    };
    if (bookingData.message && bookingData.message.trim() !== "") {
      booking.message = bookingData.message;
    }

    const docRef = await addDoc(collection(db, 'bookings'), booking);

    // Send email notification (we'll implement this later)
    await sendBookingNotification({
      ...booking,
      checkIn: booking.checkIn.toDate(),
      checkOut: booking.checkOut.toDate(),
    });

    return docRef.id;
  } catch (error) {
    throw new Error(`Failed to save booking: ${error.message}`);
  }
};

// Get all bookings (for admin panel)
export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        checkIn: data.checkIn?.toDate ? data.checkIn.toDate() : new Date(data.checkIn),
        checkOut: data.checkOut?.toDate ? data.checkOut.toDate() : new Date(data.checkOut),
      } as Booking;
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw new Error('Failed to fetch bookings');
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId: string, status: Booking['status']): Promise<void> => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, { status });
    
    // Send status update email
    await sendStatusUpdateNotification(bookingId, status);
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw new Error('Failed to update booking status');
  }
};

// Delete a booking
export const deleteBooking = async (bookingId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'bookings', bookingId));
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw new Error('Failed to delete booking');
  }
};

// Email notification functions (placeholder - we'll implement these later)
const sendBookingNotification = async (booking: any): Promise<void> => {
  // TODO: Implement email sending
};

const sendStatusUpdateNotification = async (bookingId: string, status: Booking['status']): Promise<void> => {
  // TODO: Implement status update email
}; 