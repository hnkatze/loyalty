// Tipos globales de la aplicación

// Roles de usuario
export type UserRole = "owner" | "client";

// Usuario base
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Dueño del establecimiento
export interface Owner extends User {
  role: "owner";
  establishmentId: string;
  phone?: string;
}

// Cliente
export interface Client {
  id: string;
  userId: string;
  establishmentId: string;
  name: string;
  email: string;
  phone: string;
  code: string; // Código único de 6 caracteres (ej: ABC123)
  balance: number;
  avatarURL?: string;
  createdAt: Date;
  lastVisit?: Date;
}

// Establecimiento
export interface Establishment {
  id: string;
  ownerId: string;
  name: string;
  phone?: string;
  address?: string;
  description?: string;
  logoURL?: string;
  hours: BusinessHours;
  currencyName: string;
  currencySymbol: string;
  createdAt: Date;
  updatedAt: Date;
}

// Horarios de negocio
export interface BusinessHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  closed?: boolean;
}

// Servicio
export interface Service {
  id: string;
  establishmentId: string;
  name: string;
  description?: string;
  duration: number; // minutos
  price?: number;
  isActive: boolean;
  createdAt: Date;
}

// Empleado
export interface Employee {
  id: string;
  establishmentId: string;
  name: string;
  phone?: string;
  email?: string;
  specialties: string[]; // IDs de servicios
  availability: EmployeeAvailability;
  isActive: boolean;
  createdAt: Date;
}

export interface EmployeeAvailability {
  [day: string]: {
    start: string;
    end: string;
    breakTimes?: { start: string; end: string }[];
  };
}

// Cita/Reserva
export interface Appointment {
  id: string;
  establishmentId: string;
  clientId: string;
  serviceId: string;
  employeeId: string;
  date: Date;
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

// Recompensa
export interface Reward {
  id: string;
  establishmentId: string;
  name: string;
  description?: string;
  cost: number; // puntos necesarios
  imageURL?: string;
  isActive: boolean;
  redemptionCount: number;
  createdAt: Date;
}

// Transacción de puntos
export interface Transaction {
  id: string;
  establishmentId: string;
  clientId: string;
  type: TransactionType;
  amount: number;
  rewardId?: string;
  appointmentId?: string;
  notes?: string;
  createdBy: string; // userId del dueño
  createdAt: Date;
}

export type TransactionType = "earned" | "redeemed";

// Canje de recompensa (pendiente de confirmación)
export type RedemptionStatus = "pending" | "confirmed" | "expired" | "cancelled";

export interface Redemption {
  id: string;
  code: string; // Código único (ej: CJ-ABC123)
  establishmentId: string;
  clientId: string;
  clientName: string; // Cache del nombre
  rewardId: string;
  rewardName: string; // Cache del nombre
  rewardCost: number; // Cache del costo en puntos
  status: RedemptionStatus;
  createdAt: Date;
  expiresAt: Date; // 24 horas después de creación
  confirmedAt?: Date;
  confirmedBy?: string; // userId del owner/empleado que confirmó
  cancelledAt?: Date;
}

// Auth context types
export interface AuthState {
  user: User | null;
  establishment: Establishment | null;
  loading: boolean;
  error: string | null;
  needsSetup: boolean; // true si es nuevo usuario y necesita completar setup
  isFirstUser: boolean; // true si no hay dueño aún (primer login = dueño)
}

export interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  completeOwnerSetup: (establishmentName: string) => Promise<void>;
  completeClientSetup: (phone: string) => Promise<void>;
}
