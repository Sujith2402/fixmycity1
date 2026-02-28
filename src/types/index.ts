export type IssueStatus = 'reported' | 'acknowledged' | 'verified' | 'in-progress' | 'resolved' | 'rejected' | 'escalated';
export type IssuePriority = 'high' | 'medium' | 'low';
export type UserRole = 'citizen' | 'admin';

export type IssueCategory =
  | 'Roads & Infrastructure'
  | 'Garbage & Sanitation'
  | 'Water Supply'
  | 'Electricity'
  | 'Street Lights'
  | 'Public Safety'
  | 'Traffic Issues'
  | 'Others';

export interface HistoryEntry {
  status: IssueStatus;
  updatedBy: string;
  timestamp: string;
  comment?: string;
}

export interface AdminNote {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface EscalationDetails {
  escalatedTo: string;
  escalatedAt: string;
  referenceId?: string;
  reason: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface FieldOfficer {
  id: string;
  name: string;
  department: string;
  avatar?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  status: IssueStatus;
  priority: IssuePriority;
  reportedBy: string;
  assignedTo?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  history: HistoryEntry[];
  notes: AdminNote[];
  escalationDetails?: EscalationDetails;
  assignedDepartment?: string;
  assignedOfficerId?: string;
  slaDeadline?: string;
}

export interface Notification {
  id: string;
  issueId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const CATEGORIES: { label: IssueCategory; icon: string; color: string }[] = [
  { label: 'Roads & Infrastructure', icon: 'construction', color: 'category-roads' },
  { label: 'Garbage & Sanitation', icon: 'trash-2', color: 'category-garbage' },
  { label: 'Water Supply', icon: 'droplets', color: 'category-water' },
  { label: 'Electricity', icon: 'zap', color: 'category-electricity' },
  { label: 'Street Lights', icon: 'lamp', color: 'category-lights' },
  { label: 'Public Safety', icon: 'shield-alert', color: 'category-safety' },
  { label: 'Traffic Issues', icon: 'traffic-cone', color: 'category-traffic' },
  { label: 'Others', icon: 'circle-dot', color: 'category-others' },
];

export const STATUS_LABELS: Record<IssueStatus, string> = {
  reported: 'Reported',
  acknowledged: 'Acknowledged',
  verified: 'Verified',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
  escalated: 'Escalated',
};

export const GOVERNMENT_PORTALS: Record<IssueCategory, { name: string; url: string; description: string }[]> = {
  'Roads & Infrastructure': [
    { name: 'NHAI Portal', url: 'https://nhai.gov.in/', description: 'National Highways Authority of India' },
    { name: 'MoRTH', url: 'https://morth.nic.in/', description: 'Ministry of Road Transport and Highways' }
  ],
  'Garbage & Sanitation': [
    { name: 'Swachh Bharat Mission', url: 'https://swachhbharatmission.gov.in/', description: 'Clean India Mission Official Portal' }
  ],
  'Water Supply': [
    { name: 'Jal Jeevan Mission', url: 'https://jaljeevanmission.gov.in/', description: 'National Rural Water Mission' }
  ],
  'Electricity': [
    { name: 'National Power Portal', url: 'https://npp.gov.in/', description: 'Central Electricity Authority' }
  ],
  'Street Lights': [
    { name: 'Municipal E-Governance', url: 'https://egovernments.org/', description: 'Urban Infrastructure Management' }
  ],
  'Public Safety': [
    { name: 'National Police Portal', url: 'https://digitalpolice.gov.in/', description: 'Citizen Services for Public Safety' }
  ],
  'Traffic Issues': [
    { name: 'Parivahan Sewa', url: 'https://parivahan.gov.in/', description: 'Transport Department Services' }
  ],
  Others: [
    { name: 'PG Portal', url: 'https://pgportal.gov.in/', description: 'Centralized Public Grievance Redress and Monitoring System' }
  ]
};
