export type ClientType = 'COMPANY' | 'INDIVIDUAL';

export type PipelineStage =
  | 'LEAD'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export interface Opportunity {
  id: string;
  title: string;
  amount: number;
  expectedCloseDate: string;
  stage: PipelineStage;
  notes?: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  type: ClientType;
  email: string;
  phone?: string;
  // Entreprise
  companyName?: string;
  siret?: string;
  contactName?: string;
  contactRole?: string;
  // Particulier
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
  opportunities: Opportunity[];
}