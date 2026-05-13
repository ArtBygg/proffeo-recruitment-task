import { UserDTO } from '../user/user-dto.model';

export interface LoginRequestBody {
  username: string;
  password: string;
}

export interface Tokens {
  refreshToken: string;
  accessToken: string;
}

export interface LoginResponse {
  tokens: Tokens;
  user: UserDTO;
}

export interface RefreshAccessTokenRequestBody {
  refreshToken: string;
}

export interface ResendAccountActivationLinkRequestBody {
  userId: string;
}

export interface ChangePasswordRequestBody {
  password: string;
  newPassword: string;
}

export interface ConfirmEmailSetPasswordRequestBody {
  userId: string;
  password: string;
  token: string;
}

export interface ForgotPasswordRequestBody {
  email: string;
}

export interface CheckResetPasswordTokenRequestBody {
  userId: string;
  token: string;
}

export interface ResetPasswordRequestBody {
  userId: string;
  password: string;
  token: string;
}

export interface CheckConfirmEmailTokenRequestBody {
  userId: string;
  token: string;
}
