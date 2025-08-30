import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any; // Adjust 'any' to your user type if available
    }
  }
}