export function isBlogPostMainSectionType(secType: string | undefined): boolean {
  return secType === 'blog-post-main';
}

export function isMainBlogSectionType(secType: string | undefined): boolean {
  return secType === 'main-blog';
}

export function isBlogPostMainSectionInstanceId(secId: string): boolean {
  return secId === 'blog_post_main' || secId.startsWith('blog_post_main_');
}

export function isMainBlogSectionInstanceId(secId: string): boolean {
  return secId === 'main_blog' || secId.startsWith('main_blog_');
}
