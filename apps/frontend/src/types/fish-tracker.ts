export type TransactionType = 'Buy' | 'Sell';

export interface Transaction {
  id: string;
  name: string;
  type: TransactionType;
  amount: number;
  quantity?: number;
  unitPrice?: number;
  timestamp: Date;
  synced: boolean;
}

export type Category =
  | 'Modo Libre'
  | 'Langostino'
  | 'Merluza'
  | 'Centolla'
  | 'Pulpo'
  | 'Pez Grande'
  | 'Pez Chico';
