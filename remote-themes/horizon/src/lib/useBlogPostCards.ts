import { useEffect, useMemo, useState } from 'react';
import {
  useStorefront,
  useStorefrontBlogs,
  useThemeConfig,
  type StorefrontBlogPost,
} from '@render-store/sdk';
import { cfgString } from './config';
import {
  mapBlogPostsToCards,
  readBlogPostCards,
  type BlogPostCardData,
} from './blogPostCards';

export function useBlogPostCards(
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template',
  settingsBase: string,
  postCount: number
): { cards: BlogPostCardData[]; usingLive: boolean } {
  const config = useThemeConfig();
  const { storeFrontMeta } = useStorefront();
  const { fetchVisiblePostsByBlogUrlHandle } = useStorefrontBlogs();
  const [livePosts, setLivePosts] = useState<StorefrontBlogPost[]>([]);

  const blogHandle = cfgString(config, `${settingsBase}.blogHandle`, '').trim();
  const storeId = storeFrontMeta?.storeId ?? '';

  const placeholderCards = useMemo(
    () => readBlogPostCards(config, templateId, sectionId, placement, postCount),
    [config, templateId, sectionId, placement, postCount]
  );

  useEffect(() => {
    let cancelled = false;
    if (!storeId || !blogHandle) {
      setLivePosts([]);
      return;
    }
    fetchVisiblePostsByBlogUrlHandle(storeId, blogHandle, { page: 1, limit: 12 })
      .then((posts: StorefrontBlogPost[]) => {
        if (!cancelled) setLivePosts(posts);
      })
      .catch(() => {
        if (!cancelled) setLivePosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [storeId, blogHandle, fetchVisiblePostsByBlogUrlHandle]);

  const liveCards = useMemo(
    () => mapBlogPostsToCards(livePosts, postCount, blogHandle),
    [livePosts, postCount, blogHandle]
  );

  const usingLive = liveCards.length > 0;
  return { cards: usingLive ? liveCards : placeholderCards, usingLive };
}
