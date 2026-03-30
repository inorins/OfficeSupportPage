export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TicketStatus = 'Open' | 'In Progress' | 'Pending Client' | 'Resolved' | 'Closed';
export type Environment = 'UAT' | 'Production';

export interface Ticket {
  id: string;
  title: string;
  system: string;
  module: string;
  form: string;
  priority: Priority;
  status: TicketStatus;
  environment: Environment;
  lastUpdated: string;
  reporter: string;
  reporterEmail: string;
  assignee?: string;
  description: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  author: string;
  role: 'client' | 'employee';
  content: string;
  timestamp: string;
  isInternal: boolean;
}

export const tickets: Ticket[] = [
  { id: 'TKT-2401', title: 'KYC Update form submission timeout', system: 'CBS', module: 'Client Account', form: 'KYC Update', priority: 'Critical', status: 'Open', environment: 'Production', lastUpdated: '2 hours ago', reporter: 'Rajesh Shrestha', reporterEmail: 'r.shrestha@guheshwori.com.np', assignee: 'Sarah K.', description: 'The KYC Update form times out after 30 seconds when submitting documents larger than 2MB. This affects all branches.', createdAt: '2024-03-18' },
  { id: 'TKT-2398', title: 'Loan disbursement batch job failure', system: 'CBS', module: 'Loans', form: 'Batch Disbursement', priority: 'Critical', status: 'In Progress', environment: 'Production', lastUpdated: '4 hours ago', reporter: 'Anita Maharjan', reporterEmail: 'a.maharjan@guheshwori.com.np', assignee: 'David O.', description: 'Nightly batch disbursement job fails at record 4500 with OutOfMemory exception. Affects 2000+ pending loans.', createdAt: '2024-03-17' },
  { id: 'TKT-2395', title: 'ECL model variance exceeds threshold', system: 'ECL', module: 'Provisioning', form: 'Model Config', priority: 'High', status: 'Pending Client', environment: 'UAT', lastUpdated: '1 day ago', reporter: 'Sunil Thapa', reporterEmail: 's.thapa@reliancebank.com.np', assignee: 'Mary W.', description: 'ECL Stage 2 provisioning model shows 15% variance against baseline. Need to review PD curve parameters.', createdAt: '2024-03-16' },
  { id: 'TKT-2390', title: 'Data clearing house reconciliation mismatch', system: 'DCH', module: 'Reconciliation', form: 'Daily Recon', priority: 'High', status: 'Open', environment: 'Production', lastUpdated: '1 day ago', reporter: 'Priya Karki', reporterEmail: 'p.karki@progressivebank.com.np', description: 'Daily reconciliation report shows NPR 2.3M mismatch between sent and received transactions.', createdAt: '2024-03-16' },
  { id: 'TKT-2387', title: 'User role permission not reflecting', system: 'CBS', module: 'User Management', form: 'Role Assignment', priority: 'Medium', status: 'Resolved', environment: 'UAT', lastUpdated: '2 days ago', reporter: 'Bikash Poudel', reporterEmail: 'b.poudel@ganapatibank.com.np', assignee: 'Sarah K.', description: 'After assigning Supervisor role, the user still sees Teller-level menus. Cache issue suspected.', createdAt: '2024-03-15' },
  { id: 'TKT-2380', title: 'Report export to Excel formatting issue', system: 'CBS', module: 'Reports', form: 'General Ledger Export', priority: 'Low', status: 'Closed', environment: 'Production', lastUpdated: '3 days ago', reporter: 'Sita Rai', reporterEmail: 's.rai@shreefinance.com.np', assignee: 'David O.', description: 'Excel export of GL report truncates account names longer than 40 characters.', createdAt: '2024-03-14' },
  { id: 'TKT-2375', title: 'Mobile banking API latency spike', system: 'CBS', module: 'Integration', form: 'API Gateway', priority: 'High', status: 'In Progress', environment: 'Production', lastUpdated: '3 days ago', reporter: 'Nabin Gurung', reporterEmail: 'n.gurung@goodwillbank.com.np', assignee: 'Mary W.', description: 'Mobile banking balance inquiry API response time increased from 200ms to 3s during peak hours.', createdAt: '2024-03-14' },
];

export const chatMessages: ChatMessage[] = [
  { id: '1', author: 'Rajesh Shrestha', role: 'client', content: 'Hi, the KYC form has been timing out since this morning. Our branch staff cannot process any KYC updates.', timestamp: '10:30 AM', isInternal: false },
  { id: '2', author: 'Sarah K.', role: 'employee', content: 'Hello Rajesh. I can see the issue in our logs. It appears the document upload service is experiencing high latency. Let me investigate further.', timestamp: '10:45 AM', isInternal: false },
  { id: '3', author: 'Sarah K.', role: 'employee', content: 'Checked with DevOps — the file storage service hit 95% capacity. Need to escalate to infra team for immediate expansion.', timestamp: '10:50 AM', isInternal: true },
  { id: '4', author: 'David O.', role: 'employee', content: 'I can help with the infra side. Raising a P1 with the cloud team now. ETA for storage expansion: 2 hours.', timestamp: '11:05 AM', isInternal: true },
  { id: '5', author: 'Sarah K.', role: 'employee', content: 'Rajesh, we\'ve identified the root cause — a storage capacity issue on our end. Our infrastructure team is working on it and we expect resolution within 2 hours. I\'ll keep you updated.', timestamp: '11:15 AM', isInternal: false },
  { id: '6', author: 'Rajesh Shrestha', role: 'client', content: 'Thank you Sarah. Please keep us posted. We have 50+ KYC updates pending across branches.', timestamp: '11:20 AM', isInternal: false },
];

export const systemModules: Record<string, Record<string, string[]>> = {
  CBS: {
    'Client Account': ['KYC Update', 'Account Opening', 'Account Closure', 'Signatory Update'],
    'Loans': ['Loan Application', 'Batch Disbursement', 'Loan Restructure', 'Write-Off'],
    'User Management': ['Role Assignment', 'Branch Access', 'Audit Log'],
    'Reports': ['General Ledger Export', 'Trial Balance', 'Custom Report Builder'],
    'Integration': ['API Gateway', 'MPESA Config', 'RTGS Setup'],
  },
  ECL: {
    'Provisioning': ['Model Config', 'Stage Migration', 'Override Rules'],
    'Reporting': ['IFRS9 Report', 'Regulatory Filing', 'Variance Analysis'],
  },
  DCH: {
    'Reconciliation': ['Daily Recon', 'Monthly Recon', 'Exception Handling'],
    'Settlement': ['Net Settlement', 'Gross Settlement', 'Failed Transactions'],
  },
};
