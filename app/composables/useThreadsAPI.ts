/**
 * Composable for Threads API Integration
 * Note: Threads uses Facebook's Graph API - no separate Instagram key needed!
 */

interface ThreadsPost {
  text: string;
  imageUrl?: string;
  linkUrl?: string;
}

export const useThreadsAPI = () => {
  const config = useRuntimeConfig();

  /**
   * Create a Threads media container (Step 1 of posting)
   */
  const createMediaContainer = async (accessToken: string, post: ThreadsPost) => {
    try {
      const response = await $fetch('/api/threads/create-container', {
        method: 'POST',
        body: {
          accessToken,
          text: post.text,
          imageUrl: post.imageUrl,
          linkUrl: post.linkUrl
        }
      });
      return response;
    } catch (error) {
      console.error('Error creating Threads media container:', error);
      throw error;
    }
  };

  /**
   * Publish Threads media container (Step 2 of posting)
   */
  const publishMediaContainer = async (accessToken: string, creationId: string) => {
    try {
      const response = await $fetch('/api/threads/publish', {
        method: 'POST',
        body: {
          accessToken,
          creationId
        }
      });
      return response;
    } catch (error) {
      console.error('Error publishing Threads post:', error);
      throw error;
    }
  };

  /**
   * Post to Threads (combines both steps)
   */
  const postToThreads = async (accessToken: string, post: ThreadsPost) => {
    try {
      // Step 1: Create container
      const container = await createMediaContainer(accessToken, post);
      
      // Step 2: Publish container
      const result = await publishMediaContainer(accessToken, container.id);
      
      return result;
    } catch (error) {
      console.error('Error posting to Threads:', error);
      throw error;
    }
  };

  /**
   * Get Threads user profile
   */
  const getThreadsProfile = async (accessToken: string) => {
    try {
      const response = await $fetch('/api/threads/profile', {
        method: 'POST',
        body: { accessToken }
      });
      return response;
    } catch (error) {
      console.error('Error fetching Threads profile:', error);
      throw error;
    }
  };

  /**
   * Get Threads insights/analytics
   */
  const getThreadsInsights = async (accessToken: string, postId: string) => {
    try {
      const response = await $fetch('/api/threads/insights', {
        method: 'POST',
        body: {
          accessToken,
          postId
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching Threads insights:', error);
      throw error;
    }
  };

  return {
    createMediaContainer,
    publishMediaContainer,
    postToThreads,
    getThreadsProfile,
    getThreadsInsights
  };
};

