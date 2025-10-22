/**
 * Facebook SDK Type Definitions
 */

interface Window {
  fbAsyncInit?: () => void;
  FB?: Facebook;
}

interface Facebook {
  init(params: {
    appId: string;
    cookie?: boolean;
    xfbml?: boolean;
    version: string;
  }): void;

  login(
    callback: (response: FacebookLoginResponse) => void,
    options?: {
      scope?: string;
      return_scopes?: boolean;
      auth_type?: string;
    }
  ): void;

  logout(callback: () => void): void;

  getLoginStatus(callback: (response: FacebookLoginStatusResponse) => void): void;

  api(
    path: string,
    method: string,
    params: any,
    callback: (response: any) => void
  ): void;
}

interface FacebookLoginResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: FacebookAuthResponse;
}

interface FacebookLoginStatusResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: FacebookAuthResponse;
}

interface FacebookAuthResponse {
  accessToken: string;
  userID: string;
  expiresIn: number;
  signedRequest: string;
  graphDomain: string;
  data_access_expiration_time: number;
}

declare const FB: Facebook;

