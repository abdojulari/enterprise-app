/**
 * Server API for posting to Facebook page
 */

export default defineEventHandler(async (event) => {
  const { pageId, pageAccessToken, message, imageUrl } = await readBody(event);

  if (!pageId || !pageAccessToken || !message) {
    throw createError({
      statusCode: 400,
      message: 'Page ID, page access token, and message are required'
    });
  }

  try {
    let endpoint = `https://graph.facebook.com/v18.0/${pageId}`;
    let body: any = {
      message: message,
      access_token: pageAccessToken
    };

    // If there's an image, post as photo, otherwise as feed post
    if (imageUrl) {
      endpoint += '/photos';
      body.url = imageUrl;
    } else {
      endpoint += '/feed';
    }

    const response = await $fetch(endpoint, {
      method: 'POST',
      body: body
    });

    return {
      success: true,
      postId: response.id,
      message: 'Posted successfully to Facebook'
    };
  } catch (error: any) {
    console.error('Facebook Post API error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to post to Facebook'
    });
  }
});

