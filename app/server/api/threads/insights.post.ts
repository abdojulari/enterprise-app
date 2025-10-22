/**
 * Server API for fetching Threads post insights/analytics
 */

export default defineEventHandler(async (event) => {
  const { accessToken, postId } = await readBody(event);

  if (!accessToken || !postId) {
    throw createError({
      statusCode: 400,
      message: 'Access token and post ID are required'
    });
  }

  try {
    // Fetch post insights
    const response = await $fetch(
      `https://graph.threads.net/v1.0/${postId}/insights?metric=views,likes,replies,reposts,quotes&access_token=${accessToken}`
    );

    return response;
  } catch (error: any) {
    console.error('Threads insights error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch Threads insights'
    });
  }
});

