import Dexie from "dexie";

export interface User {
  id?: number;
  name?: string;
  privateKey: string;
  publicKey: string;
  auth_id?: string;
}

export class QuestsDB extends Dexie {
  user!: Dexie.Table<User, number>;

  constructor() {
    super("QuestsDB");
    this.version(1).stores({
      user: "++id",
    });
  }
}

export const db = new QuestsDB();
