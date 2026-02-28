import { Issue, User, Notification, FieldOfficer } from '@/types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Priya Sharma', email: 'priya@example.com', phone: '+91-9876543210', role: 'citizen', createdAt: '2025-01-15T10:00:00Z' },
  { id: 'u2', name: 'Rahul Verma', email: 'rahul@example.com', role: 'citizen', createdAt: '2025-01-20T08:30:00Z' },
  { id: 'u3', name: 'Anita Desai', email: 'anita@example.com', role: 'citizen', createdAt: '2025-02-01T12:00:00Z' },
  { id: 'u4', name: 'Admin User', email: 'admin@fixmycity.gov', role: 'admin', createdAt: '2024-12-01T00:00:00Z' },
  { id: 'u5', name: 'Vikram Singh', email: 'vikram@example.com', role: 'citizen', createdAt: '2025-02-10T09:00:00Z' },
];

export const mockOfficers: FieldOfficer[] = [
  { id: 'o1', name: 'Officer Rajesh Kumar', department: 'Public Works Dept.', avatar: 'https://i.pravatar.cc/150?u=o1' },
  { id: 'o2', name: 'Officer Sneha Rao', department: 'Garbage & Sanitation', avatar: 'https://i.pravatar.cc/150?u=o2' },
  { id: 'o3', name: 'Officer Amit Shah', department: 'Water Board', avatar: 'https://i.pravatar.cc/150?u=o3' },
  { id: 'o4', name: 'Officer Priya Menon', department: 'Electrical Dept.', avatar: 'https://i.pravatar.cc/150?u=o4' },
  { id: 'o5', name: 'Officer Vikram Rathore', department: 'Public Safety', avatar: 'https://i.pravatar.cc/150?u=o5' },
];

export const mockIssues: Issue[] = [
  {
    id: 'ISS-001',
    title: 'Large pothole on MG Road',
    description: 'A dangerous pothole near the central junction causing accidents. Multiple vehicles have been damaged. Immediate repair needed.',
    category: 'Roads & Infrastructure',
    latitude: 12.9716,
    longitude: 77.5946,
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop',
    status: 'in-progress',
    priority: 'high',
    reportedBy: 'u1',
    assignedDepartment: 'Public Works Dept.',
    assignedOfficerId: 'o1',
    slaDeadline: new Date(Date.now() - 86400000).toISOString(), // Overdue
    createdAt: '2026-02-20T08:30:00Z',
    updatedAt: '2026-02-22T14:00:00Z',
    upvotes: 47,
    history: [
      { status: 'reported', updatedBy: 'u1', timestamp: '2026-02-20T08:30:00Z' },
      { status: 'acknowledged', updatedBy: 'u4', timestamp: '2026-02-21T09:00:00Z', comment: 'Assigned to PWD team Alpha' },
      { status: 'in-progress', updatedBy: 'u4', timestamp: '2026-02-22T14:00:00Z', comment: 'Repair crew dispatched' }
    ],
    notes: [
      { id: 'n1', author: 'u4', content: 'Contacted PWD manager. They will start work by Monday.', timestamp: '2026-02-21T10:00:00Z' }
    ]
  },
  {
    id: 'ISS-002',
    title: 'Garbage not collected for 3 days',
    description: 'The garbage bins near Sector 5 park are overflowing. Stray animals are spreading waste everywhere.',
    category: 'Garbage & Sanitation',
    latitude: 12.9780,
    longitude: 77.5900,
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop',
    status: 'reported',
    priority: 'medium',
    reportedBy: 'u2',
    createdAt: '2026-02-23T06:15:00Z',
    updatedAt: '2026-02-23T06:15:00Z',
    upvotes: 23,
    history: [
      { status: 'reported', updatedBy: 'u2', timestamp: '2026-02-23T06:15:00Z' }
    ],
    notes: []
  },
  {
    id: 'ISS-003',
    title: 'No water supply since morning',
    description: 'Entire Block C of Indira Nagar has no water supply since 6 AM. Residents are facing severe difficulty.',
    category: 'Water Supply',
    latitude: 12.9650,
    longitude: 77.6100,
    status: 'verified',
    priority: 'high',
    reportedBy: 'u3',
    assignedDepartment: 'Water Board',
    assignedOfficerId: 'o3',
    slaDeadline: new Date(Date.now() + 14400000).toISOString(), // Nearing Deadline (4 hours)
    createdAt: '2026-02-24T06:00:00Z',
    updatedAt: '2026-02-24T09:30:00Z',
    upvotes: 89,
    history: [
      { status: 'reported', updatedBy: 'u3', timestamp: '2026-02-24T06:00:00Z' },
      { status: 'verified', updatedBy: 'u4', timestamp: '2026-02-24T09:30:00Z', comment: 'Main pipeline leak confirmed' }
    ],
    notes: [
      { id: 'n2', author: 'u4', content: 'Water board notified. Repair estimated 6 hours.', timestamp: '2026-02-24T10:00:00Z' }
    ]
  },
  {
    id: 'ISS-004',
    title: 'Street light broken on 5th Cross',
    description: 'The street light near the school on 5th Cross has been broken for a week. The area is very dark at night and unsafe.',
    category: 'Street Lights',
    latitude: 12.9690,
    longitude: 77.6000,
    status: 'resolved',
    priority: 'medium',
    reportedBy: 'u1',
    assignedDepartment: 'Electrical Dept.',
    assignedOfficerId: 'o4',
    resolutionNotes: 'Bulb replaced and wiring fixed on Feb 21.',
    createdAt: '2026-02-14T18:00:00Z',
    updatedAt: '2026-02-21T11:00:00Z',
    upvotes: 15,
    history: [
      { status: 'reported', updatedBy: 'u1', timestamp: '2026-02-14T18:00:00Z' },
      { status: 'acknowledged', updatedBy: 'u4', timestamp: '2026-02-15T10:00:00Z' },
      { status: 'resolved', updatedBy: 'u4', timestamp: '2026-02-21T11:00:00Z', comment: 'Verified by field agent' }
    ],
    notes: []
  },
  {
    id: 'ISS-005',
    title: 'Exposed electrical wire near park',
    description: 'Dangerously exposed high-voltage wire hanging low near the children\'s play area in Cubbon Park.',
    category: 'Electricity',
    latitude: 12.9763,
    longitude: 77.5929,
    status: 'in-progress',
    priority: 'high',
    reportedBy: 'u5',
    assignedDepartment: 'Electrical Dept.',
    assignedOfficerId: 'o4',
    slaDeadline: new Date(Date.now() - 172800000).toISOString(), // Critically Overdue
    createdAt: '2026-02-22T15:30:00Z',
    updatedAt: '2026-02-23T10:00:00Z',
    upvotes: 112,
    history: [
      { status: 'reported', updatedBy: 'u5', timestamp: '2026-02-22T15:30:00Z' },
      { status: 'acknowledged', updatedBy: 'u4', timestamp: '2026-02-22T16:00:00Z' },
      { status: 'in-progress', updatedBy: 'u4', timestamp: '2026-02-23T10:00:00Z' }
    ],
    notes: []
  },
  {
    id: 'ISS-006',
    title: 'Traffic signal not working at Circle',
    description: 'The traffic signal at Domlur Circle has been malfunctioning since yesterday. Causing major traffic jams during peak hours.',
    category: 'Traffic Issues',
    latitude: 12.9610,
    longitude: 77.6380,
    status: 'escalated',
    priority: 'high',
    reportedBy: 'u2',
    createdAt: '2026-02-25T07:45:00Z',
    updatedAt: '2026-02-26T14:00:00Z',
    upvotes: 34,
    history: [
      { status: 'reported', updatedBy: 'u2', timestamp: '2026-02-25T07:45:00Z' },
      { status: 'escalated', updatedBy: 'u4', timestamp: '2026-02-26T14:00:00Z', comment: 'Requires interstate traffic board coordination' }
    ],
    notes: [],
    escalationDetails: {
      escalatedTo: 'City Traffic Control Board',
      escalatedAt: '2026-02-26T14:00:00Z',
      reason: 'Cross-jurisdictional infrastructure issue',
      referenceId: 'TCB-AB-2026-99'
    }
  },
  {
    id: 'ISS-011',
    title: 'Illegal dumping in restricted zone',
    description: 'Trucks seen dumping construction waste in the green belt area near Sector 4.',
    category: 'Garbage & Sanitation',
    latitude: 12.9200,
    longitude: 77.6500,
    status: 'reported',
    priority: 'high',
    reportedBy: 'u2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    upvotes: 12,
    history: [{ status: 'reported', updatedBy: 'u2', timestamp: new Date().toISOString() }],
    notes: []
  },
  {
    id: 'ISS-012',
    title: 'Vandalized park equipment',
    description: 'Swings and benches in the neighborhood park have been spray-painted and partially broken.',
    category: 'Public Safety',
    latitude: 12.9300,
    longitude: 77.6600,
    status: 'reported',
    priority: 'medium',
    reportedBy: 'u3',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    upvotes: 8,
    history: [{ status: 'reported', updatedBy: 'u3', timestamp: new Date(Date.now() - 3600000).toISOString() }],
    notes: []
  },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', issueId: 'ISS-001', message: 'Your issue "Large pothole on MG Road" is now In Progress', read: false, createdAt: '2026-02-22T14:00:00Z' },
  { id: 'n2', issueId: 'ISS-004', message: 'Your issue "Street light broken" has been Resolved!', read: false, createdAt: '2026-02-21T11:00:00Z' },
  { id: 'n3', issueId: 'ISS-003', message: 'Your issue "No water supply" has been Verified by authorities', read: true, createdAt: '2026-02-24T09:30:00Z' },
  { id: 'n4', issueId: 'ISS-005', message: 'High priority issue near you: Exposed electrical wire', read: true, createdAt: '2026-02-22T16:00:00Z' },
];

export const currentUser = mockUsers[0]; // Priya Sharma

// AI Priority Calculation (simulated)
export function calculatePriority(category: string, description: string): 'high' | 'medium' | 'low' {
  const highPriorityKeywords = ['danger', 'accident', 'exposed', 'wire', 'fire', 'collapse', 'flood', 'emergency', 'unsafe', 'critical', 'life', 'death', 'electr', 'voltage'];
  const mediumPriorityKeywords = ['broken', 'overflow', 'stray', 'dark', 'stench', 'health', 'hazard'];

  const text = (category + ' ' + description).toLowerCase();

  if (['Electricity', 'Public Safety'].includes(category) || highPriorityKeywords.some(k => text.includes(k))) return 'high';
  if (mediumPriorityKeywords.some(k => text.includes(k))) return 'medium';
  return 'low';
}

// Duplicate detection (simulated)
export function findDuplicates(lat: number, lng: number, category: string, radiusKm = 0.5): Issue[] {
  return mockIssues.filter(issue => {
    if (issue.category !== category) return false;
    const dist = haversine(lat, lng, issue.latitude, issue.longitude);
    return dist <= radiusKm;
  });
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
