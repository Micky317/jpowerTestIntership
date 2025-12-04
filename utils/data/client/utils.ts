export type CreateClient = {
  name: string;
  accountManager?: string;
  serviceChannel?: {
    category: string;
    priority: string;
    statusPrimary: string;
    statusExtended: string;
    subscriberId: string;
    tradeName: string;
  };
};
