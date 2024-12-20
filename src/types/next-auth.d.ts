import "next-auth"

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
    };
    accessToken?: string;
    error?: string;
    provider?:string;
  }
}

