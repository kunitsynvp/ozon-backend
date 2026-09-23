export type User = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

export type Store = {
  id: string;
  name?: string;
  clientId: string;
  status: string;
  isActive: boolean;
  createdAt: Date;

  userId: string;
  user: User;
};
