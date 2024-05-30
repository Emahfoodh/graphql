type User = {
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  auditRatio: number;
  totalUp: number;
  totalDown: number;
  xp: number;
  attrs: string; // this is the gender
};

type UserModuleEvent = {
  eventId: number;
  path: string;
  level: number;
  registrationId: number;
};

type Transaction = {
  amount: number;
  createdAt: string;
  object: {
    name: string;
  };
  accumulated: number; // use it after sorting
};

