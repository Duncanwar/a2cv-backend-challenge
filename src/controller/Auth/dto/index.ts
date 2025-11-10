export interface AuthSingUpDTO {
  username: string;
  email: string;
  password: string;
}

export interface LoginDTO extends Omit<AuthSingUpDTO, "username"> {}
