import { Appointment } from '@/types';

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'John Smith',
    serviceId: '1',
    serviceName: 'Haircut & Styling',
    date: formatDate(today),
    startTime: '10:00',
    endTime: '10:45',
    status: 'confirmed',
    notes: 'Regular client, prefers scissors over clippers',
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Michael Johnson',
    serviceId: '2',
    serviceName: 'Beard Trim',
    date: formatDate(today),
    startTime: '11:00',
    endTime: '11:30',
    status: 'confirmed',
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'David Williams',
    serviceId: '3',
    serviceName: 'Full Service (Haircut & Beard)',
    date: formatDate(today),
    startTime: '13:00',
    endTime: '14:00',
    status: 'pending',
    notes: 'New client',
  },
  {
    id: '4',
    clientId: '4',
    clientName: 'Robert Brown',
    serviceId: '1',
    serviceName: 'Haircut & Styling',
    date: formatDate(tomorrow),
    startTime: '09:30',
    endTime: '10:15',
    status: 'confirmed',
  },
  {
    id: '5',
    clientId: '5',
    clientName: 'James Miller',
    serviceId: '4',
    serviceName: 'Hair Coloring',
    date: formatDate(tomorrow),
    startTime: '14:00',
    endTime: '15:30',
    status: 'confirmed',
    notes: 'Wants to try a new color',
  },
  {
    id: '6',
    clientId: '1',
    clientName: 'John Smith',
    serviceId: '2',
    serviceName: 'Beard Trim',
    date: formatDate(dayAfterTomorrow),
    startTime: '10:00',
    endTime: '10:30',
    status: 'confirmed',
  },
  {
    id: '7',
    clientId: '6',
    clientName: 'Thomas Davis',
    serviceId: '5',
    serviceName: 'Hot Towel Shave',
    date: formatDate(dayAfterTomorrow),
    startTime: '11:00',
    endTime: '11:45',
    status: 'pending',
  },
];