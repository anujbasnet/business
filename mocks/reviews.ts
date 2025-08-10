export type Review = {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  reply?: string;
  replyDate?: string;
};

export const mockReviews: Review[] = [
  {
    id: 'review_1',
    clientName: 'Sarah Johnson',
    rating: 5,
    comment: 'Amazing service! The haircut was exactly what I wanted and the staff was so friendly. The salon has a great atmosphere and I felt very comfortable throughout my visit.',
    date: '2024-01-15',
  },
  {
    id: 'review_2',
    clientName: 'Michael Chen',
    rating: 4,
    comment: 'Great experience overall. The barber was skilled and professional. Only minor issue was the wait time, but the quality of service made up for it.',
    date: '2024-01-10',
    reply: 'Thank you for your feedback Michael! We appreciate your patience and are working on reducing wait times. Looking forward to seeing you again!',
    replyDate: '2024-01-11',
  },
  {
    id: 'review_3',
    clientName: 'Emma Davis',
    rating: 5,
    comment: 'Absolutely love this place! Been coming here for months and they never disappoint. The attention to detail is incredible.',
    date: '2024-01-08',
  },
];