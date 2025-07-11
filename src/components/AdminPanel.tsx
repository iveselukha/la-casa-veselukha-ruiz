
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { getAllBookings, updateBookingStatus, deleteBooking, Booking } from "@/lib/bookingService";
import { loadRoomSettings, saveRoomSettings, RoomSettings } from "@/lib/roomSettingsService";
import { format } from "date-fns";
import { Calendar, Users, Mail, Trash2, CheckCircle, XCircle, Clock, BarChart3, TrendingUp, Settings } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Dialog as ConfirmDialog, DialogContent as ConfirmDialogContent } from "@/components/ui/dialog";

export const AdminPanel = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'settings'>('dashboard');
  const [roomSettings, setRoomSettings] = useState<RoomSettings>(loadRoomSettings());
  const [roomFilter, setRoomFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [actionConfirmation, setActionConfirmation] = useState<{id: string, type: 'cancelled' | 'confirmed'} | null>(null);

  useEffect(() => {
    loadBookings();
    loadRoomSettingsFromStorage();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load room settings
  const loadRoomSettingsFromStorage = () => {
    const settings = loadRoomSettings();
    setRoomSettings(settings);
  };

  // Toggle room availability
  const toggleRoomAvailability = (roomId: string) => {
    const newSettings = {
      ...roomSettings,
      [roomId]: {
        ...roomSettings[roomId],
        enabled: !roomSettings[roomId].enabled
      }
    };
    saveRoomSettings(newSettings);
    setRoomSettings(newSettings);
  };

  // Update booking period for a room
  const updateBookingPeriod = (roomId: string, bookingUntil: string) => {
    const newSettings = {
      ...roomSettings,
      [roomId]: {
        ...roomSettings[roomId],
        bookingUntil
      }
    };
    saveRoomSettings(newSettings);
    setRoomSettings(newSettings);
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      // If trying to confirm a booking, check for conflicts first
      if (newStatus === 'confirmed') {
        const bookingToConfirm = bookings.find(b => b.id === bookingId);
        if (bookingToConfirm && wouldCreateConflict(bookingToConfirm)) {
          alert('Cannot confirm this booking - it conflicts with an existing confirmed booking for the same dates.');
          return;
        }
      }

      await updateBookingStatus(bookingId, newStatus);
      await loadBookings(); // Reload to get updated data
      
      // Show success message
      const statusText = newStatus === 'confirmed' ? 'confirmed' : 
                        newStatus === 'cancelled' ? 'cancelled' : 'updated';
      alert(`Booking ${statusText} successfully!`);
    } catch (err) {
      alert('Failed to update booking status');
      console.error(err);
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    try {
      await deleteBooking(bookingId);
      await loadBookings(); // Reload to get updated data
    } catch (err) {
      alert('Failed to delete booking');
      console.error(err);
    }
  };

  const handleDeleteClick = (bookingId: string) => {
    setBookingToDelete(bookingId);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (bookingToDelete) {
      await handleDelete(bookingToDelete);
      setDeleteDialogOpen(false);
      setBookingToDelete(null);
    }
  };
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setBookingToDelete(null);
  };

  // Check if confirming a booking would create a conflict
  const wouldCreateConflict = (bookingToConfirm: Booking): boolean => {
    const otherConfirmedBookings = bookings.filter(booking => 
      booking.id !== bookingToConfirm.id && 
      booking.status === 'confirmed' &&
      booking.roomId === bookingToConfirm.roomId
    );

    const checkInDate = bookingToConfirm.checkIn instanceof Date ? bookingToConfirm.checkIn : bookingToConfirm.checkIn.toDate();
    const checkOutDate = bookingToConfirm.checkOut instanceof Date ? bookingToConfirm.checkOut : bookingToConfirm.checkOut.toDate();

    return otherConfirmedBookings.some(booking => {
      const bookingCheckIn = booking.checkIn instanceof Date ? booking.checkIn : booking.checkIn.toDate();
      const bookingCheckOut = booking.checkOut instanceof Date ? booking.checkOut : booking.checkOut.toDate();

      // Check for overlap
      return (
        (checkInDate >= bookingCheckIn && checkInDate < bookingCheckOut) ||
        (checkOutDate > bookingCheckIn && checkOutDate <= bookingCheckOut) ||
        (checkInDate <= bookingCheckIn && checkOutDate >= bookingCheckOut)
      );
    });
  };

  // Calculate dashboard stats
  const dashboardStats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
  };

  // Calculate guest leaderboard (total days per email)
  const guestLeaderboard = () => {
    const guestStats = new Map<string, { name: string; email: string; totalDays: number; bookings: number }>();
    
    bookings.forEach(booking => {
      if (booking.status === 'confirmed') {
        const checkIn = booking.checkIn instanceof Date ? booking.checkIn : booking.checkIn.toDate();
        const checkOut = booking.checkOut instanceof Date ? booking.checkOut : booking.checkOut.toDate();
        const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        
        const existing = guestStats.get(booking.guestEmail);
        if (existing) {
          existing.totalDays += days;
          existing.bookings += 1;
        } else {
          guestStats.set(booking.guestEmail, {
            name: booking.guestName,
            email: booking.guestEmail,
            totalDays: days,
            bookings: 1
          });
        }
      }
    });
    
    return Array.from(guestStats.values())
      .sort((a, b) => b.totalDays - a.totalDays)
      .slice(0, 10); // Top 10 guests
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Filtered bookings
  const filteredBookings = bookings.filter(booking => {
    // Room filter
    if (roomFilter !== 'all' && booking.roomId !== roomFilter) return false;
    // Status filter
    if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
    // Date range filter (checkIn date)
    const checkInDate = booking.checkIn instanceof Date ? booking.checkIn : booking.checkIn.toDate();
    if (dateFrom && checkInDate < new Date(dateFrom)) return false;
    if (dateTo && checkInDate > new Date(dateTo)) return false;
    // Search filter (guest name or email)
    if (search && !(
      booking.guestName.toLowerCase().includes(search.toLowerCase()) ||
      booking.guestEmail.toLowerCase().includes(search.toLowerCase())
    )) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">La Casa Veselukha Ruiz Admin</h1>
        <p className="text-gray-600">Manage bookings and view analytics</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'bookings'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Bookings
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Settings
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalBookings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.pendingBookings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Confirmed</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.confirmedBookings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cancelled</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.cancelledBookings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guest Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Guests (Most Days Booked)
              </CardTitle>
              <p className="text-sm text-gray-600">Ranked by total confirmed booking days</p>
            </CardHeader>
            <CardContent>
              {guestLeaderboard().length === 0 ? (
                <p className="text-gray-500 text-center py-8">No confirmed bookings yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Rank</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Guest</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Total Days</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Bookings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guestLeaderboard().map((guest, index) => (
                        <tr key={guest.email} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-50 text-gray-600'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">{guest.name}</td>
                          <td className="py-3 px-4 text-gray-600">{guest.email}</td>
                          <td className="py-3 px-4 font-semibold text-blue-600">{guest.totalDays} days</td>
                          <td className="py-3 px-4 text-gray-600">{guest.bookings} booking{guest.bookings !== 1 ? 's' : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'bookings' && (
        <>
          {/* Filters and search bar */}
          <div className="flex flex-wrap gap-2 mb-4 items-end">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Room</label>
              <select value={roomFilter} onChange={e => setRoomFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
                <option value="all">All</option>
                <option value="room-1">Room Uno</option>
                <option value="room-2">Room Dos</option>
                <option value="room-3">El Sofá</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">From</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border rounded px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">To</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border rounded px-2 py-1 text-sm" />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs text-gray-600 mb-1">Search</label>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Guest name or email"
                className="border rounded px-2 py-1 text-sm w-full"
              />
            </div>
            <button
              type="button"
              className="ml-2 px-3 py-1 text-xs rounded bg-gray-100 border border-gray-300 hover:bg-gray-200"
              onClick={() => { setRoomFilter('all'); setStatusFilter('all'); setDateFrom(''); setDateTo(''); setSearch(''); }}
            >
              Reset
            </button>
          </div>
          {/* End filters and search bar */}
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No bookings found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="border-l-4 border-l-blue-500">
                  {actionConfirmation && actionConfirmation.id === booking.id ? (
                    <div className="flex flex-col items-center justify-center py-8 fade-in">
                      <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-500 mb-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <h2 className="text-xl font-semibold text-terracotta-700 mb-2 text-center">
                        {actionConfirmation.type === 'cancelled' ? 'Booking Cancelled' : 'Booking Confirmed'}
                      </h2>
                      <p className="text-sage-700 text-center mb-4">
                        {actionConfirmation.type === 'cancelled'
                          ? 'This booking has been marked as cancelled.'
                          : 'This booking has been marked as confirmed.'}
                      </p>
                      <Button onClick={() => setActionConfirmation(null)} className="animated-btn bg-terracotta-600 hover:bg-terracotta-700 text-white w-full max-w-xs">Close</Button>
                    </div>
                  ) : (
                  <>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{booking.roomName}</CardTitle>
                        <p className="text-gray-600">{booking.guestName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{booking.guestEmail}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          {format(booking.checkIn instanceof Date ? booking.checkIn : booking.checkIn.toDate(), 'MMM dd, yyyy')} - {format(booking.checkOut instanceof Date ? booking.checkOut : booking.checkOut.toDate(), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{booking.guests} guest(s)</span>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        {format(booking.createdAt instanceof Date ? booking.createdAt : booking.createdAt.toDate(), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>

                    {booking.message && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">{booking.message}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(booking.id!, 'confirmed')}
                                className={`${
                                  wouldCreateConflict(booking) 
                                    ? "bg-gray-400 cursor-not-allowed" 
                                    : "bg-green-600 hover:bg-green-700"
                                }`}
                                disabled={wouldCreateConflict(booking)}
                                title={wouldCreateConflict(booking) ? "This booking conflicts with an existing confirmed booking" : ""}
                              >
                                Confirm
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Mark this booking as confirmed (requires conflict check)</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(booking.id!, 'cancelled')}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-1" /> Cancel Booking
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Mark this booking as cancelled (keeps a record)</TooltipContent>
                          </Tooltip>
                        </>
                      )}
                      
                      {booking.status === 'confirmed' && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(booking.id!, 'cancelled')}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 mr-1" /> Cancel Booking
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Mark this booking as cancelled (keeps a record)</TooltipContent>
                        </Tooltip>
                      )}
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(booking.id!)}
                            className="border-red-500 text-red-700 hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Delete Permanently
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Permanently delete this booking (cannot be undone)</TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                  </>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Room Booking Settings
              </CardTitle>
              <p className="text-sm text-gray-600">
                Control which rooms are available for booking requests
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(roomSettings).map(([roomId, room]) => (
                  <div key={roomId} className="p-4 border border-gray-200 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                        <p className="text-sm text-gray-600">
                          {room.enabled ? 'Accepting new bookings' : 'Bookings temporarily disabled'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                          {room.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <Switch
                          checked={room.enabled}
                          onCheckedChange={() => toggleRoomAvailability(roomId)}
                        />
                      </div>
                    </div>
                    
                    {room.enabled && (
                      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                        <label className="text-sm font-medium text-gray-700">
                          Accept bookings until:
                        </label>
                        <input
                          type="date"
                          value={room.bookingUntil || '2024-12-31'}
                          onChange={(e) => updateBookingPeriod(roomId, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-500">
                          {room.bookingUntil ? `Until ${new Date(room.bookingUntil).toLocaleDateString()}` : 'No limit set'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> When a room is disabled, users won't be able to submit new booking requests for that room. 
                  Existing bookings will remain unaffected.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Delete confirmation dialog */}
      <ConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <ConfirmDialogContent className="max-w-xs text-center">
          <h2 className="text-lg font-semibold mb-2">Delete Booking?</h2>
          <p className="mb-4 text-gray-600">This will permanently delete the booking. This action cannot be undone.</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            <Button variant="outline" onClick={cancelDelete}>Cancel</Button>
          </div>
        </ConfirmDialogContent>
      </ConfirmDialog>
    </div>
  );
};
