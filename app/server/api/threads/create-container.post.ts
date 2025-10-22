/**
 * Server API for creating Threads media container
 * Step 1 of posting to Threads
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { accessToken, text, imageUrl, linkUrl } = await readBody(event);

  if (!accessToken || !text) {
    throw createError({
      statusCode: 400,
      message: 'Access token and text are required'
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
    
    // Build the request parameters
    const params: any = {
      media_type: imageUrl ? 'IMAGE' : 'TEXT',
      text: text,
      access_token: accessToken
    };

    if (imageUrl) {
      params.image_url = imageUrl;
    }

    if (linkUrl) {
      params.link_attachment = linkUrl;
    }

    // Create the media container
    const response = await $fetch(
      `https://graph.threads.net/v1.0/${threadsUserId}/threads`,
      {
        method: 'POST',
        body: params
      }
    );

    return {
      success: true,
      id: response.id,
      message: 'Media container created successfully'
    };
  } catch (error: any) {
    console.error('Threads create container error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to create Threads media container'
    });
  }
});

