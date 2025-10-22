/**
 * Server API for publishing Threads media container
 * Step 2 of posting to Threads
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { accessToken, creationId } = await readBody(event);

  if (!accessToken || !creationId) {
    throw createError({
      statusCode: 400,
      message: 'Access token and creation ID are required'
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

    // Publish the media container
    const response = await $fetch(
      `https://graph.threads.net/v1.0/${threadsUserId}/threads_publish`,
      {
        method: 'POST',
        body: {
          creation_id: creationId,
          access_token: accessToken
        }
      }
    );

    return {
      success: true,
      id: response.id,
      message: 'Posted successfully to Threads'
    };
  } catch (error: any) {
    console.error('Threads publish error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to publish to Threads'
    });
  }
});

