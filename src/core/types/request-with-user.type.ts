import { Request } from 'express';

export type RequestWithUser = Request & { userId?: string };
