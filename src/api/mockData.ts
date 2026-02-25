import type { Metric, Integration, Followup, School, Referral } from '../types';

// Mock data for development
export const mockSchoolMetrics: Metric[] = [
  { label: 'Total Calls', value: 1247, change: 12 },
  { label: 'Inquiry Calls', value: 892, change: 8 },
  { label: 'Tours Booked', value: 234, change: 15 },
  { label: 'Forms Sent', value: 567, change: -3 },
];

export const mockAdminMetrics: Metric[] = [
  { label: 'Total Schools', value: 45, change: 5 },
  { label: 'Total Calls', value: 12470, change: 12 },
  { label: 'Inquiry Calls', value: 8920, change: 8 },
  { label: 'Tours Booked', value: 2340, change: 15 },
];

export const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Microsoft Outlook',
    type: 'outlook',
    connected: true,
    connectedAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Google Workspace',
    type: 'google',
    connected: false,
  },
];

export const mockFollowups: Followup[] = [
  {
    id: '1',
    leadName: 'John Doe',
    type: 'SMS',
    status: 'sent',
    timestamp: '2024-02-20T10:30:00Z',
  },
  {
    id: '2',
    leadName: 'Jane Smith',
    type: 'Email',
    status: 'pending',
    timestamp: '2024-02-20T11:15:00Z',
  },
  {
    id: '3',
    leadName: 'Bob Johnson',
    type: 'SMS',
    status: 'sent',
    timestamp: '2024-02-20T09:45:00Z',
  },
];

export const mockSchools: School[] = [
  {
    id: '1',
    name: 'Sunshine Montessori',
    aiNumber: '+1 (555) 123-4567',
    status: 'active',
    calls: 1247,
    tours: 234,
  },
  {
    id: '2',
    name: 'Oak Tree Academy',
    aiNumber: '+1 (555) 234-5678',
    status: 'active',
    calls: 892,
    tours: 156,
  },
  {
    id: '3',
    name: 'River Valley School',
    aiNumber: '+1 (555) 345-6789',
    status: 'inactive',
    calls: 456,
    tours: 89,
  },
];

export const mockReferrals: Referral[] = [
  {
    id: '1',
    referrerSchool: 'Sunshine Montessori',
    newSchool: 'Oak Tree Academy',
    date: '2024-01-15',
  },
  {
    id: '2',
    referrerSchool: 'Oak Tree Academy',
    newSchool: 'River Valley School',
    date: '2024-02-01',
  },
];

