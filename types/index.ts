export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
  lastVisit?: string;
  upcomingAppointment?: string;
  avatar?: string;
  createdAt: string;
  totalVisits: number;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: string;
};

export type Appointment = {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  bookingSource: 'direct' | 'bronapp' | 'phone' | 'walk-in';
};

export type AppNotification = {
  id: string;
  type: 'new_appointment' | 'appointment_changed' | 'appointment_cancelled';
  title: string;
  message: string;
  clientName: string;
  appointmentId?: string;
  timestamp: string;
  isRead: boolean;
};

export type PortfolioItem = {
  id: string;
  imageUrl: string;
  description: string;
  serviceCategory: string;
  date: string;
};

export type BusinessProfileExceptions = {
  closedDates: string[];
  shortDays: Array<{
    date: string;
    openTime: string;
    closeTime: string;
  }>;
};

export type BusinessProfile = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  workingHours: {
    [key: string]: {
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    };
  };
  exceptions?: BusinessProfileExceptions;
  bio: string;
  profileImage?: string;
  logoUrl?: string; // added to sync with backend web app
  coverPhotos?: string[];
  mainCoverPhotoIndex?: number;
  website?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    telegram?: string;
    youtube?: string;
    tiktok?: string;
  };
  businessType: string;
  serviceType?: string;
  employees?: string[];
  isAcceptingBookings: boolean;
  bookingSettings: {
    advanceBookingDays: number;
    cancellationPolicy: string;
    requiresConfirmation: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

export type BookingRequest = {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceId: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

export type TimeSlot = {
  time: string;
  available: boolean;
  appointmentId?: string;
};

export type AvailabilityResponse = {
  date: string;
  slots: TimeSlot[];
};

export type Review = {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  reply?: string;
  replyDate?: string;
};