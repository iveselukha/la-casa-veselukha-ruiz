export interface RoomSetting {
  name: string;
  enabled: boolean;
  bookingUntil?: string; // ISO date string for when bookings are allowed until
}

export interface RoomSettings {
  'room-1': RoomSetting;
  'room-2': RoomSetting;
  'room-3': RoomSetting;
}

const defaultSettings: RoomSettings = {
  'room-1': { name: 'Room Uno', enabled: true, bookingUntil: '2024-12-31' },
  'room-2': { name: 'Room Dos', enabled: true, bookingUntil: '2024-12-31' },
  'room-3': { name: 'El Sofa', enabled: true, bookingUntil: '2024-12-31' }
};

// Load room settings from localStorage
export const loadRoomSettings = (): RoomSettings => {
  try {
    const savedSettings = localStorage.getItem('roomSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (err) {
    console.error('Failed to load room settings:', err);
  }
  return defaultSettings;
};

// Save room settings to localStorage
export const saveRoomSettings = (settings: RoomSettings): void => {
  try {
    localStorage.setItem('roomSettings', JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save room settings:', err);
  }
};

// Check if a room is enabled for booking
export const isRoomEnabled = (roomId: string): boolean => {
  const settings = loadRoomSettings();
  const roomSetting = settings[roomId as keyof RoomSettings];
  if (!roomSetting?.enabled) return false;
  
  // Check if booking period has expired
  if (roomSetting.bookingUntil) {
    const bookingUntilDate = new Date(roomSetting.bookingUntil);
    const today = new Date();
    if (today > bookingUntilDate) return false;
  }
  
  return true;
}; 