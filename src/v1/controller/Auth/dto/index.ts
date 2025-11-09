export interface AuthSingUpDTO {
  fullName: string;
  email: string;
  password: string;
  isActive: boolean;
  role: string;
}

export interface LoginDTO extends Omit<AuthSingUpDTO, "fullName"> {}
