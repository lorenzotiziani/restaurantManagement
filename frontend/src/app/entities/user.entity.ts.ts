export type User = {
  id: number;
  email: string;
  password: string;
  nome: string;
  cognome: string;
  telefono: string;
  attivo: boolean;
  createdAt: Date;
  updatedAt: Date;
  ruoloId: number;
};

