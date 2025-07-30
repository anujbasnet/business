export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
  lastVisit?: string;
  upcomingAppointment?: string;
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
  serviceId: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
};

export type PortfolioItem = {
  id: string;
  imageUrl: string;
  description: string;
  serviceCategory: string;
  date: string;
};

export type BusinessProfile = {
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
  bio: string;
  profileImage?: string;
};