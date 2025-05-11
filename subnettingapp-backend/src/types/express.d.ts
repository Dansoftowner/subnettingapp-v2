declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      fullName: string;
      email: string;
    };
  }
}
