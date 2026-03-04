
export interface Staff {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
}

export interface BreakRecord {
  id: string;
  staffName: string;
  supervisorName: string;
  date: string;
  shift: string;
  schedule: string;
  // Breaks
  break30_1_From: string;
  break30_1_To: string;
  break30_2_From: string;
  break30_2_To: string;
  break10_1_From: string;
  break10_1_To: string;
  break10_2_From: string;
  break10_2_To: string;
  createdAt: number;
}

export type ViewType = 'dashboard' | 'staff' | 'history' | 'insights';
