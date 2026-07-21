export type BlogPostDetailsLocationState = {
  articleJustCreated?: boolean;
};

export function readArticleJustCreated(state: unknown): boolean {
  if (!state || typeof state !== 'object') return false;
  return Boolean((state as BlogPostDetailsLocationState).articleJustCreated);
}
