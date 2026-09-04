import {
  ADMIN_FEATURE_MAP,
  MODULE_KEY_MAP,
  buildClientNavSearchCatalog,
  type ClientNavSearchItem,
} from './client-nav-catalog';

type AuthUser = {
  role?: string;
  permissions?: string[];
  allowedChannels?: string[];
};

type FilterCtx = {
  user: AuthUser | null;
  features: Record<string, boolean | undefined>;
};

function itemVisible(href: string, features: Record<string, boolean | undefined>): boolean {
  const adminKey = ADMIN_FEATURE_MAP[href];
  if (adminKey && features[adminKey] === false) return false;
  return true;
}

/** Same visibility rules as ClientSidebar — for global search results. */
export function filterClientNavCatalog(ctx: FilterCtx): ClientNavSearchItem[] {
  const { user, features } = ctx;
  const catalog = buildClientNavSearchCatalog();

  const byFeature = catalog.filter((item) => itemVisible(item.href, features));

  const perms = user?.permissions ?? [];
  const byPerm =
    user?.role === 'agent' && perms.length > 0
      ? byFeature.filter((item) => {
          const sectionKey = MODULE_KEY_MAP[item.section];
          if (!sectionKey) return true;
          if (perms.includes(sectionKey)) return true;
          return perms.includes(item.href);
        })
      : byFeature;

  const allowedCh = user?.allowedChannels ?? [];
  const byChannel =
    user?.role === 'agent' && allowedCh.length > 0
      ? byPerm.filter((item) => {
          if (item.section !== 'Inbox') return true;
          const m = item.href.match(/channel=([a-z_]+)/);
          return !m || allowedCh.includes(m[1]);
        })
      : byPerm;

  return byChannel;
}
