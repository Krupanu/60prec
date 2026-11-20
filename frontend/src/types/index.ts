// Типы данных по контракту REST API (см. PROJECT_SPEC.md)

export type Role = 'CLIENT' | 'VEHICLE_OWNER' | 'MANAGER';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
  blocked?: boolean;
  createdAt?: string;
}

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export type TourType = 'BEACH' | 'EXCURSION' | 'SKI' | 'CRUISE' | 'ADVENTURE';

export interface Tour {
  id: number;
  title: string;
  description: string;
  country: string;
  city: string;
  type: TourType;
  price: number;
  durationDays: number;
  maxPersons: number;
  imageUrl?: string;
  active: boolean;
  avgRating: number;
  reviewsCount?: number;
  createdAt?: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id: number;
  user?: User;
  tour: Tour;
  startDate: string;
  persons: number;
  totalPrice: number;
  status: BookingStatus;
  promoCode?: PromoCode | null;
  createdAt?: string;
}

export type TransportType = 'BUS' | 'MINIVAN' | 'CAR';

export interface Transport {
  id: number;
  model: string;
  plateNumber: string;
  type: TransportType;
  seats: number;
  owner?: User;
}

export type TripStatus = 'SCHEDULED' | 'READY' | 'EN_ROUTE' | 'COMPLETED' | 'CANCELLED';

export interface Trip {
  id: number;
  tour: Tour;
  transport: Transport;
  departureDate: string;
  status: TripStatus;
}

export interface Review {
  id: number;
  user: User;
  tour?: Tour;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PromoCode {
  id: number;
  code: string;
  discountPercent: number;
  validFrom: string;
  validTo: string;
  maxUses: number;
  usedCount: number;
  active: boolean;
}

export interface PromoValidation {
  valid: boolean;
  discountPercent: number;
  message: string;
}

export interface DocumentItem {
  id: number;
  tripId?: number;
  fileName: string;
  fileType: string;
  uploadedAt: string;
}

// Пагинация Spring Data
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// Ответ об ошибке (GlobalExceptionHandler)
export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
}

export interface BookingCreateRequest {
  tourId: number;
  startDate: string;
  persons: number;
  promoCode?: string;
}

export interface TourRequest {
  title: string;
  description: string;
  country: string;
  city: string;
  type: TourType;
  price: number;
  durationDays: number;
  maxPersons: number;
  imageUrl?: string;
  active?: boolean;
}

export interface TransportRequest {
  model: string;
  plateNumber: string;
  type: TransportType;
  seats: number;
  ownerId: number;
}

export interface PromoCodeRequest {
  code: string;
  discountPercent: number;
  validFrom: string;
  validTo: string;
  maxUses: number;
  active: boolean;
}
