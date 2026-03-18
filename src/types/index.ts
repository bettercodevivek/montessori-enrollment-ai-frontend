export type UserRole = 'admin' | 'school';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  schoolId?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface Metric {
  label: string;
  value: number;
  change?: number;
}

export interface Integration {
  id: string;
  name: string;
  type: 'outlook' | 'google';
  connected: boolean;
  connectedAt?: string;
  email?: string | null;
}

export interface Followup {
  id: string;
  leadName: string;
  type: 'SMS' | 'Email';
  status: 'sent' | 'pending' | 'failed';
  timestamp: string;
}

export interface School {
  id: string;
  name: string;
  aiNumber: string;
  status: 'active' | 'inactive';
  calls: number;
  tours: number;
}

export interface Referral {
  id: string;
  referrerSchool: string;
  newSchool: string;
  date: string;
}

export interface FormQuestion {
  id: string;
  question: string;
  required: boolean;
}

