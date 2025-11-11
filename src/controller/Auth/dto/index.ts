export interface AuthSignUpDTO {
  username: string;
  email: string;
  password: string;
  role?: Enumerator
}

export interface LoginDTO extends Omit<AuthSignUpDTO, "username"> {}
