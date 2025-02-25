
export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
  }
  
  export interface RegisterRequest {
    username?: string;
    fullname?: string;
    password?: string;
    confirmPassword?: string;


  }

  export interface ResetPasswordRequest{
  
    newPassword: string;
    confirmNewPassword: string;
  }