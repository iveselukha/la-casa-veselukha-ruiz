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
  checkIn: Date;
  checkOut: Date;
  guests: number;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
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
    const booking: Omit<Booking, 'id' | 'createdAt'> = {
      roomId: bookingData.roomId,
      roomName: bookingData.roomName,
      guestName: bookingData.guestName,
      guestEmail: bookingData.guestEmail,
      checkIn: new Date(bookingData.checkIn),
      checkOut: new Date(bookingData.checkOut),
      guests: bookingData.guests,
      message: bookingData.message,
      status: 'pending',
    };

    const docRef = await addDoc(collection(db, 'bookings'), {
      ...booking,
      createdAt: Timestamp.now(),
    });

    // Send email notification (we'll implement this later)
    await sendBookingNotification(booking);

    return docRef.id;
  } catch (error) {
    console.error('Error saving booking:', error);
    throw new Error('Failed to save booking');
  }
};

// Get all bookings (for admin panel)
export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      checkIn: doc.data().checkIn?.toDate() || new Date(),
      checkOut: doc.data().checkOut?.toDate() || new Date(),
    })) as Booking[];
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
const sendBookingNotification = async (booking: Omit<Booking, 'id' | 'createdAt'>): Promise<void> => {
  // TODO: Implement email sending
  console.log('Sending booking notification for:', booking.guestEmail);
};

const sendStatusUpdateNotification = async (bookingId: string, status: Booking['status']): Promise<void> => {
  // TODO: Implement status update email
  console.log('Sending status update for booking:', bookingId, 'Status:', status);
}; 