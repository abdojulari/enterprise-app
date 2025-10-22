/**
 * Server API for fetching user's Facebook pages
 */

export default defineEventHandler(async (event) => {
  const { userAccessToken } = await readBody(event);

  if (!userAccessToken) {
    throw createError({
      statusCode: 400,
      message: 'User access token is required'
    });
  }

  try {
    // Get user's pages from Facebook Graph API
    const response = await $fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${userAccessToken}`
    );

    return response.data || [];
  } catch (error: any) {
    console.error('Facebook Pages API error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch Facebook pages'
    });
  }
});

