/**
 * Composable for Facebook Authentication and SDK Integration
 */

interface FacebookAuthResponse {
  accessToken: string;
  userID: string;
  expiresIn: number;
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
}

export const useFacebookAuth = () => {
  const config = useRuntimeConfig();
  const isSDKLoaded = ref(false);
  const isAuthenticated = ref(false);
  const userAccessToken = ref<string>('');
  const userPages = ref<FacebookPage[]>([]);

  /**
   * Initialize Facebook SDK
   */
  const initFacebookSDK = () => {
    return new Promise<void>((resolve) => {
      if (isSDKLoaded.value) {
        resolve();
        return;
      }

      window.fbAsyncInit = function() {
        FB.init({
          appId: config.public.facebookAppId,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        
        isSDKLoaded.value = true;
        
        // Check login status
        FB.getLoginStatus((response: any) => {
          if (response.status === 'connected') {
            isAuthenticated.value = true;
            userAccessToken.value = response.authResponse.accessToken;
          }
        });
        
        resolve();
      };

      // Load SDK if not already loaded
      if (!document.getElementById('facebook-jssdk')) {
        const js = document.createElement('script');
        js.id = 'facebook-jssdk';
        js.src = 'https://connect.facebook.net/en_US/sdk.js';
        document.body.appendChild(js);
      }
    });
  };

  /**
   * Login with Facebook
   * Permissions needed: pages_manage_posts, pages_read_engagement
   */
  const login = async () => {
    await initFacebookSDK();
    
    return new Promise<FacebookAuthResponse>((resolve, reject) => {
      FB.login(function(response: any) {
        if (response.authResponse) {
          isAuthenticated.value = true;
          userAccessToken.value = response.authResponse.accessToken;
          resolve(response.authResponse);
        } else {
          reject(new Error('User cancelled login or did not fully authorize'));
        }
      }, {
        scope: 'pages_manage_posts,pages_read_engagement,pages_show_list'
      });
    });
  };

  /**
   * Logout from Facebook
   */
  const logout = async () => {
    await initFacebookSDK();
    
    return new Promise<void>((resolve) => {
      FB.logout(() => {
        isAuthenticated.value = false;
        userAccessToken.value = '';
        userPages.value = [];
        resolve();
      });
    });
  };

  /**
   * Get user's Facebook pages
   */
  const getPages = async () => {
    if (!userAccessToken.value) {
      throw new Error('Not authenticated. Please login first.');
    }

    try {
      const response = await $fetch('/api/facebook/pages', {
        method: 'POST',
        body: {
          userAccessToken: userAccessToken.value
        }
      });
      
      userPages.value = response as FacebookPage[];
      return response;
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }
  };

  /**
   * Post to Facebook page
   */
  const postToPage = async (pageId: string, pageAccessToken: string, message: string, imageUrl?: string) => {
    try {
      const response = await $fetch('/api/facebook/post', {
        method: 'POST',
        body: {
          pageId,
          pageAccessToken,
          message,
          imageUrl
        }
      });
      return response;
    } catch (error) {
      console.error('Error posting to Facebook:', error);
      throw error;
    }
  };

  return {
    isSDKLoaded,
    isAuthenticated,
    userAccessToken,
    userPages,
    initFacebookSDK,
    login,
    logout,
    getPages,
    postToPage
  };
};

