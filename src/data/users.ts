export type UserRole = 'inorins' | 'client';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  title: string;
  // client-only
  bankName?: string;
  bankDomain?: string;
  bankShortCode?: string;
}

export const mockUsers: AppUser[] = [
  // ── Inorins Support Team ───────────────────────────────────────────
  {
    id: 'u-inorins-1',
    name: 'Sarah Kamau',
    email: 'sarah@inorins.com',
    password: 'demo123',
    role: 'inorins',
    title: 'Support Lead',
  },
  {
    id: 'u-inorins-2',
    name: 'David Odhiambo',
    email: 'david@inorins.com',
    password: 'demo123',
    role: 'inorins',
    title: 'Support Engineer',
  },
  {
    id: 'u-inorins-3',
    name: 'Mary Wanjiru',
    email: 'mary@inorins.com',
    password: 'demo123',
    role: 'inorins',
    title: 'Support Engineer',
  },

  // ── Client Banks ───────────────────────────────────────────────────
  {
    id: 'u-client-1',
    name: 'Guheshwori Admin',
    email: 'admin@guheshwori.com.np',
    password: 'demo123',
    role: 'client',
    title: 'IT Administrator',
    bankName: 'Guheshwori',
    bankDomain: 'guheshwori.com.np',
    bankShortCode: 'GH',
  },
  {
    id: 'u-client-2',
    name: 'Reliance Admin',
    email: 'admin@reliancebank.com.np',
    password: 'demo123',
    role: 'client',
    title: 'IT Administrator',
    bankName: 'Reliance',
    bankDomain: 'reliancebank.com.np',
    bankShortCode: 'RL',
  },
  {
    id: 'u-client-3',
    name: 'Progressive Admin',
    email: 'admin@progressivebank.com.np',
    password: 'demo123',
    role: 'client',
    title: 'IT Administrator',
    bankName: 'Progressive',
    bankDomain: 'progressivebank.com.np',
    bankShortCode: 'PG',
  },
  {
    id: 'u-client-4',
    name: 'Ganapati Admin',
    email: 'admin@ganapatibank.com.np',
    password: 'demo123',
    role: 'client',
    title: 'IT Administrator',
    bankName: 'Ganapati',
    bankDomain: 'ganapatibank.com.np',
    bankShortCode: 'GN',
  },
  {
    id: 'u-client-5',
    name: 'Goodwill Admin',
    email: 'admin@goodwillbank.com.np',
    password: 'demo123',
    role: 'client',
    title: 'IT Administrator',
    bankName: 'Goodwill',
    bankDomain: 'goodwillbank.com.np',
    bankShortCode: 'GW',
  },
  {
    id: 'u-client-6',
    name: 'Shree Finance Admin',
    email: 'admin@shreefinance.com.np',
    password: 'demo123',
    role: 'client',
    title: 'IT Administrator',
    bankName: 'Shree Finance',
    bankDomain: 'shreefinance.com.np',
    bankShortCode: 'SF',
  },
];
