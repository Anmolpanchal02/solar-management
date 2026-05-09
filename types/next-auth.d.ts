import 'next-auth';
import { UserRole } from './index';

declare module 'next-auth' {
  interface User {
    id: string;
    role: UserRole;
    phone: string;
    avatar?: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      phone: string;
      avatar?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    phone: string;
    avatar?: string;
  }
}
