import type { BlogCommentsMode } from '../../contexts/blog.context';
import type { BlogPostVisibility } from '../../contexts/blog-post.context';
import type { CollectionProductSort } from '../../components/collections/collection-form.types';
import { COLLECTION_PRODUCT_SORT_OPTIONS } from '../../components/collections/collection-form.types';

export type CodiixFormFieldType = 'text' | 'select' | 'textarea';

export type CodiixFormField = {
  id: string;
  label: string;
  type: CodiixFormFieldType;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  options?: { value: string; label: string }[];
  defaultValue?: string;
  help?: string;
};

export type CodiixChatFormKind = 'create-blog' | 'create-blog-post' | 'create-collection';

export type CodiixChatFormStatus = 'idle' | 'submitting' | 'done' | 'error';

export type CodiixChatForm = {
  id: string;
  kind: CodiixChatFormKind;
  title: string;
  submitLabel: string;
  fields: CodiixFormField[];
  status?: CodiixChatFormStatus;
  errorMessage?: string;
};

export type CodiixBlogOption = {
  id: string;
  title: string;
};

export type CodiixCreateBlogInput = {
  title: string;
  urlHandle?: string;
  comments?: BlogCommentsMode;
};

export type CodiixCreateBlogResult = {
  id: string;
  title: string;
  path: string;
};

export type CodiixCreateBlogPostInput = {
  blogId: string;
  title: string;
  content?: string;
  author?: string;
  visibility?: BlogPostVisibility;
  urlHandle?: string;
};

export type CodiixCreateBlogPostResult = {
  id: string;
  title: string;
  path: string;
};

export type CodiixCollectionStatus = 'draft' | 'published';

export type CodiixCreateCollectionInput = {
  title: string;
  description?: string;
  urlHandle?: string;
  status?: CodiixCollectionStatus;
  productSort?: CollectionProductSort;
};

export type CodiixCreateCollectionResult = {
  id: string;
  title: string;
  path: string;
};

const COMMENT_OPTIONS: { value: BlogCommentsMode; label: string }[] = [
  { value: 'disabled', label: 'Disabled' },
  { value: 'moderated', label: 'Allowed, pending moderation' },
  { value: 'allowed', label: 'Allowed' },
];

const VISIBILITY_OPTIONS: { value: BlogPostVisibility; label: string }[] = [
  { value: 'hidden', label: 'Hidden' },
  { value: 'visible', label: 'Visible' },
];

const COLLECTION_STATUS_OPTIONS: { value: CodiixCollectionStatus; label: string }[] = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

export function buildCreateBlogForm(): CodiixChatForm {
  return {
    id: `create-blog-${Date.now()}`,
    kind: 'create-blog',
    title: 'New blog',
    submitLabel: 'Create blog',
    fields: [
      {
        id: 'title',
        label: 'Title',
        type: 'text',
        required: true,
        placeholder: 'e.g. News, Journal, Updates',
        maxLength: 255,
      },
      {
        id: 'urlHandle',
        label: 'URL handle',
        type: 'text',
        placeholder: 'Optional — auto from title if blank',
        help: 'Shown as blogs/your-handle on the storefront',
      },
      {
        id: 'comments',
        label: 'Comments',
        type: 'select',
        defaultValue: 'disabled',
        options: COMMENT_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
      },
    ],
    status: 'idle',
  };
}

export function buildCreateBlogPostForm(blogs: CodiixBlogOption[]): CodiixChatForm {
  const options = blogs.map((b) => ({ value: b.id, label: b.title }));
  const defaultBlogId = options[0]?.value ?? '';

  return {
    id: `create-blog-post-${Date.now()}`,
    kind: 'create-blog-post',
    title: 'New blog post',
    submitLabel: 'Create blog post',
    fields: [
      {
        id: 'blogId',
        label: 'Blog',
        type: 'select',
        required: true,
        defaultValue: defaultBlogId,
        options,
        help: 'Which blog this post belongs to',
      },
      {
        id: 'title',
        label: 'Title',
        type: 'text',
        required: true,
        placeholder: 'Post title',
        maxLength: 255,
      },
      {
        id: 'content',
        label: 'Content',
        type: 'textarea',
        placeholder: 'Write your post (you can refine later on the details page)',
      },
      {
        id: 'author',
        label: 'Author',
        type: 'text',
        placeholder: 'Optional',
      },
      {
        id: 'visibility',
        label: 'Visibility',
        type: 'select',
        defaultValue: 'hidden',
        options: VISIBILITY_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
      },
      {
        id: 'urlHandle',
        label: 'URL handle',
        type: 'text',
        placeholder: 'Optional — auto from title if blank',
      },
    ],
    status: 'idle',
  };
}

export function buildCreateCollectionForm(): CodiixChatForm {
  return {
    id: `create-collection-${Date.now()}`,
    kind: 'create-collection',
    title: 'New collection',
    submitLabel: 'Create collection',
    fields: [
      {
        id: 'title',
        label: 'Title',
        type: 'text',
        required: true,
        placeholder: 'e.g. Summer sale, New arrivals',
        maxLength: 255,
      },
      {
        id: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Optional — you can refine later on the details page',
      },
      {
        id: 'urlHandle',
        label: 'URL handle',
        type: 'text',
        placeholder: 'Optional — auto from title if blank',
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        defaultValue: 'published',
        options: COLLECTION_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
      },
      {
        id: 'productSort',
        label: 'Product sort',
        type: 'select',
        defaultValue: 'manual',
        options: COLLECTION_PRODUCT_SORT_OPTIONS.map((o) => ({
          value: o.value,
          label: o.label,
        })),
      },
    ],
    status: 'idle',
  };
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9\s'#?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * “Create a blog post” / “add article” — not explanatory FAQ questions.
 */
export function matchCreateBlogPostCommand(raw: string): boolean {
  const query = normalize(raw);
  if (!query) return false;

  if (
    /\b(how (do|does|to)|what (is|are|does)|where (is|are|do)|why|explain|tell me about)\b/.test(
      query,
    )
  ) {
    return false;
  }

  if (/\b(create|add|make|new|write|publish)\b/.test(query)) {
    if (/\b(blog\s*posts?|articles?)\b/.test(query)) return true;
    if (/\bpost\b/.test(query) && /\bblog\b/.test(query)) return true;
  }

  return /^(create|add|make|new|write)\s+(a\s+)?(blog\s*post|article)$/.test(query);
}

/**
 * “Create a blog” / “add blog” — not “how do I create a blog?” FAQ
 * and not “create a blog post / article”.
 */
export function matchCreateBlogCommand(raw: string): boolean {
  const query = normalize(raw);
  if (!query) return false;

  // Blog posts / articles are handled separately.
  if (matchCreateBlogPostCommand(raw)) return false;
  if (/\b(blog\s*post|article)\b/.test(query)) return false;

  // Explanatory questions → FAQ, not the create form.
  if (
    /\b(how (do|does|to)|what (is|are|does)|where (is|are|do)|why|explain|tell me about)\b/.test(
      query,
    )
  ) {
    return false;
  }

  if (
    /\b(create|add|make|new|start)\b/.test(query) &&
    /\bblogs?\b/.test(query)
  ) {
    return true;
  }

  return /^(create|add|make|new)\s+(a\s+)?blog$/.test(query);
}

/**
 * “Create a collection” / “add collection” — not explanatory FAQ questions.
 */
export function matchCreateCollectionCommand(raw: string): boolean {
  const query = normalize(raw);
  if (!query) return false;

  if (
    /\b(how (do|does|to)|what (is|are|does)|where (is|are|do)|why|explain|tell me about)\b/.test(
      query,
    )
  ) {
    return false;
  }

  if (
    /\b(create|add|make|new|start)\b/.test(query) &&
    /\bcollections?\b/.test(query)
  ) {
    return true;
  }

  return /^(create|add|make|new)\s+(a\s+)?collection$/.test(query);
}

export function parseCreateBlogFormValues(
  values: Record<string, string>,
): CodiixCreateBlogInput | { error: string } {
  const title = (values.title ?? '').trim();
  if (!title) return { error: 'Title is required.' };

  const urlHandle = (values.urlHandle ?? '').trim();
  const commentsRaw = (values.comments ?? 'disabled').trim() as BlogCommentsMode;
  const comments: BlogCommentsMode =
    commentsRaw === 'moderated' || commentsRaw === 'allowed' ? commentsRaw : 'disabled';

  return {
    title: title.slice(0, 255),
    urlHandle: urlHandle || undefined,
    comments,
  };
}

export function parseCreateBlogPostFormValues(
  values: Record<string, string>,
): CodiixCreateBlogPostInput | { error: string } {
  const blogId = (values.blogId ?? '').trim();
  if (!blogId) return { error: 'Select a blog first.' };

  const title = (values.title ?? '').trim();
  if (!title) return { error: 'Title is required.' };

  const content = (values.content ?? '').trim();
  const author = (values.author ?? '').trim();
  const urlHandle = (values.urlHandle ?? '').trim();
  const visibilityRaw = (values.visibility ?? 'hidden').trim() as BlogPostVisibility;
  const visibility: BlogPostVisibility =
    visibilityRaw === 'visible' ? 'visible' : 'hidden';

  return {
    blogId,
    title: title.slice(0, 255),
    content: content || undefined,
    author: author || undefined,
    urlHandle: urlHandle || undefined,
    visibility,
  };
}

const PRODUCT_SORT_SET = new Set<string>(
  COLLECTION_PRODUCT_SORT_OPTIONS.map((o) => o.value),
);

export function parseCreateCollectionFormValues(
  values: Record<string, string>,
): CodiixCreateCollectionInput | { error: string } {
  const title = (values.title ?? '').trim();
  if (!title) return { error: 'Title is required.' };

  const description = (values.description ?? '').trim();
  const urlHandle = (values.urlHandle ?? '').trim();
  const statusRaw = (values.status ?? 'published').trim() as CodiixCollectionStatus;
  const status: CodiixCollectionStatus = statusRaw === 'draft' ? 'draft' : 'published';
  const sortRaw = (values.productSort ?? 'manual').trim();
  const productSort: CollectionProductSort = PRODUCT_SORT_SET.has(sortRaw)
    ? (sortRaw as CollectionProductSort)
    : 'manual';

  return {
    title: title.slice(0, 255),
    description: description || undefined,
    urlHandle: urlHandle || undefined,
    status,
    productSort,
  };
}
