export interface User {
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
  ruolo?: { nome: string };
}

export interface userView {
  id: number;
  email: string;
  nome: string;
  cognome: string;
  telefono: string;
  ruolo: string;
}
