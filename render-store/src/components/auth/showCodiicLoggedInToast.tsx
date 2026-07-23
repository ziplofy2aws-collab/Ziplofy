import toast from 'react-hot-toast';

export type CodiicLoggedInToastUser = {
  _id: string;
  storeId: string;
  firstName: string;
  lastName: string;
  email: string;
};

const TOAST_ID = 'codiic-logged-in';
const SESSION_KEY_PREFIX = 'codiic-sso-toast:';

function sessionKeyForUser(user: CodiicLoggedInToastUser): string {
  return `${SESSION_KEY_PREFIX}${user.storeId}:${user._id}`;
}

export function clearCodiicLoggedInToastSession(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(SESSION_KEY_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    /* ignore */
  }
}

function displayName(user: CodiicLoggedInToastUser): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return name || user.email || 'Customer';
}

function initials(user: CodiicLoggedInToastUser): string {
  const first = (user.firstName || '').trim().charAt(0);
  const last = (user.lastName || '').trim().charAt(0);
  const fromName = `${first}${last}`.toUpperCase();
  if (fromName) return fromName;
  return (user.email || 'C').charAt(0).toUpperCase();
}

/** Shopdeck-style SSO toast: “Logged in with Codiic” + account details. */
export function showCodiicLoggedInToast(
  user: CodiicLoggedInToastUser,
  options?: { storeName?: string | null; markSessionShown?: boolean }
): void {
  if (options?.markSessionShown !== false) {
    try {
      sessionStorage.setItem(sessionKeyForUser(user), '1');
    } catch {
      /* ignore */
    }
  }

  const name = displayName(user);
  const storeLabel = options?.storeName?.trim() || null;

  toast.custom(
    (t) => (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          minWidth: 280,
          maxWidth: 360,
          padding: '12px 14px',
          borderRadius: 12,
          background: '#111827',
          color: '#f9fafb',
          boxShadow: '0 12px 40px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(255,255,255,0.06)',
          opacity: t.visible ? 1 : 0,
          transform: t.visible ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'opacity 180ms ease, transform 180ms ease',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          aria-hidden
          style={{
            flexShrink: 0,
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(145deg, #7c3aed 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          {initials(user)}
        </div>

        <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 2,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#a5b4fc',
              }}
            >
              Logged in with Codiic
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 600,
              color: '#ffffff',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </p>
          {user.email ? (
            <p
              style={{
                margin: '2px 0 0',
                fontSize: 12,
                color: 'rgba(249, 250, 251, 0.72)',
                lineHeight: 1.35,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.email}
            </p>
          ) : null}
          {storeLabel ? (
            <p
              style={{
                margin: '6px 0 0',
                fontSize: 11,
                color: 'rgba(249, 250, 251, 0.55)',
                lineHeight: 1.3,
              }}
            >
              Signed in on {storeLabel}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => toast.dismiss(t.id)}
          style={{
            flexShrink: 0,
            marginTop: -2,
            marginRight: -4,
            width: 28,
            height: 28,
            border: 'none',
            borderRadius: 8,
            background: 'transparent',
            color: 'rgba(249, 250, 251, 0.55)',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    ),
    {
      id: TOAST_ID,
      duration: 5600,
      position: 'top-right',
    }
  );
}

export function hasShownCodiicLoggedInToast(user: CodiicLoggedInToastUser): boolean {
  try {
    return Boolean(sessionStorage.getItem(sessionKeyForUser(user)));
  } catch {
    return false;
  }
}
