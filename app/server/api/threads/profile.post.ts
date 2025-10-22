/**
 * Server API for fetching Threads profile information
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { accessToken } = await readBody(event);

  if (!accessToken) {
    throw createError({
      statusCode: 400,
      message: 'Access token is required'
    });
  }

  if (!config.public.threadsUserId) {
    throw createError({
      statusCode: 500,
      message: 'Threads user ID is not configured'
    });
  }

  try {
    const threadsUserId = config.public.threadsUserId;

    // Fetch profile data
    const response = await $fetch(
      `https://graph.threads.net/v1.0/${threadsUserId}?fields=id,username,threads_profile_picture_url,threads_biography&access_token=${accessToken}`
    );

    return response;
  } catch (error: any) {
    console.error('Threads profile error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch Threads profile'
    });
  }
});

