import { BusinessProfile } from '@/types';

export const mockBusinessProfile: BusinessProfile = {
  name: 'Elite Barber Shop',
  address: '123 Main Street, Anytown, USA',
  phone: '(555) 123-4567',
  email: 'contact@elitebarbershop.com',
  workingHours: {
    monday: {
      isOpen: true,
      openTime: '09:00',
      closeTime: '18:00',
    },
    tuesday: {
      isOpen: true,
      openTime: '09:00',
      closeTime: '18:00',
    },
    wednesday: {
      isOpen: true,
      openTime: '09:00',
      closeTime: '18:00',
    },
    thursday: {
      isOpen: true,
      openTime: '09:00',
      closeTime: '20:00',
    },
    friday: {
      isOpen: true,
      openTime: '09:00',
      closeTime: '20:00',
    },
    saturday: {
      isOpen: true,
      openTime: '10:00',
      closeTime: '16:00',
    },
    sunday: {
      isOpen: false,
      openTime: '',
      closeTime: '',
    },
  },
  bio: 'Elite Barber Shop has been providing premium grooming services since 2010. Our team of skilled barbers specializes in classic and modern styles, beard grooming, and premium shaving services.',
  profileImage: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b',
};