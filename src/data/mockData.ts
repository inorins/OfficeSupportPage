export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TicketStatus = 'Open' | 'In Progress' | 'Pending Client' | 'Resolved' | 'Closed';
export type Environment = 'UAT' | 'Production';

export interface AttachmentMetadata {
  name: string;
  size: number;
  type: string;
}

export interface Ticket {
  id: string;
  title: string;
  bankName?: string;
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
  attachments?: AttachmentMetadata[];
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
