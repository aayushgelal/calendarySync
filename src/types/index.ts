// export interface Calendar {
//     id: string;
//     summary: string;
//     description?: string;
//     backgroundColor?: string;
//     primary?: boolean;
//   }
  // Types
 export  type Calendar = {
    id: string;
    name: string;
    provider: string;
    accountId: string;
  };
  
 export  type Connection = {
    connected: boolean;
    accountId: string;
    hasValidToken: boolean;
  };
 export type Account = {
    id: string;
    provider: string;
    email: string;
    isSubAccount: boolean;
  };
  
export  type GroupedAccounts = {
    google: Account[];
    microsoft: Account[];
  };
 
  
export  type Connections = Record<string, Connection>;
  
