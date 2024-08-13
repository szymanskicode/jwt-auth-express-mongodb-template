export type JWTPayload = {
  _id: string;
};

export type ValidationErrors = {
  email?: string | undefined;
  password?: string | undefined;
  repeatPassword?: string | undefined;
  title?: string | undefined;
  content?: string | undefined;
  isPublished?: string | undefined;
  error?: string | undefined;
};

export interface IUser {
  email: string;
  password: string;
  tokens: string[];
}
