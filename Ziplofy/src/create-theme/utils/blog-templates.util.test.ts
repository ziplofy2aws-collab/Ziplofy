import { describe, expect, it } from 'vitest';
import {
  resolveBlogPostTemplateIdFromThemeConfig,
  resolveBlogsTemplateIdFromThemeConfig,
  writeBlogPostsTemplateAssignments,
  writeBlogsTemplateAssignments,
} from './blog-templates.util';

function configFixture(): Record<string, unknown> {
  return {
    templates: {
      blogs: {
        name: 'Default blog',
        sections: {},
        section_order: [],
      },
      'blogs.news': {
        name: 'News',
        sections: {},
        section_order: [],
      },
    },
    blogs_template_order: ['blogs', 'blogs.news'],
  };
}

function blogPostConfigFixture(): Record<string, unknown> {
  return {
    templates: {
      'blog-posts': {
        name: 'Default blog post',
        sections: {},
        section_order: [],
      },
      'blog-posts.feature': {
        name: 'Feature',
        sections: {},
        section_order: [],
      },
    },
    blog_posts_template_order: ['blog-posts', 'blog-posts.feature'],
  };
}

describe('blog template assignments', () => {
  it('writes handle assignments and updates counts', () => {
    const config = configFixture();

    writeBlogsTemplateAssignments(config, {
      journal: 'default',
      news: 'blogs.news',
    });

    expect(config.blogs_template_assignments).toEqual({
      journal: 'default',
      news: 'blogs.news',
    });
    const templates = config.templates as Record<string, Record<string, unknown>>;
    expect(templates.blogs.assignedBlogCount).toBe(1);
    expect(templates['blogs.news'].assignedBlogCount).toBe(1);
  });

  it('resolves an alternate template from the loaded theme JSON', () => {
    const config = configFixture();
    writeBlogsTemplateAssignments(config, {
      news: 'blogs.news',
    });

    expect(resolveBlogsTemplateIdFromThemeConfig(config, 'NEWS')).toBe('blogs.news');
  });

  it('falls back when an assignment or template is missing', () => {
    const config = configFixture();
    writeBlogsTemplateAssignments(config, {
      archived: 'blogs.deleted',
    });

    expect(resolveBlogsTemplateIdFromThemeConfig(config, 'unassigned')).toBe('blogs');
    expect(resolveBlogsTemplateIdFromThemeConfig(config, 'archived')).toBe('blogs');
  });
});

describe('blog post template assignments', () => {
  it('writes composite route assignments and updates counts', () => {
    const config = blogPostConfigFixture();

    writeBlogPostsTemplateAssignments(config, {
      'journal/welcome': 'default',
      'news/launch': 'blog-posts.feature',
    });

    expect(config.blog_posts_template_assignments).toEqual({
      'journal/welcome': 'default',
      'news/launch': 'blog-posts.feature',
    });
    const templates = config.templates as Record<string, Record<string, unknown>>;
    expect(templates['blog-posts'].assignedBlogPostCount).toBe(1);
    expect(templates['blog-posts.feature'].assignedBlogPostCount).toBe(1);
  });

  it('resolves by blog and article handles without an entity API assignment', () => {
    const config = blogPostConfigFixture();
    writeBlogPostsTemplateAssignments(config, {
      'news/launch': 'blog-posts.feature',
    });

    expect(resolveBlogPostTemplateIdFromThemeConfig(config, 'NEWS', 'LAUNCH')).toBe(
      'blog-posts.feature'
    );
  });

  it('keeps identical article handles isolated by blog and falls back safely', () => {
    const config = blogPostConfigFixture();
    writeBlogPostsTemplateAssignments(config, {
      'news/welcome': 'blog-posts.feature',
      'journal/welcome': 'blog-posts.removed',
    });

    expect(resolveBlogPostTemplateIdFromThemeConfig(config, 'news', 'welcome')).toBe(
      'blog-posts.feature'
    );
    expect(resolveBlogPostTemplateIdFromThemeConfig(config, 'journal', 'welcome')).toBe(
      'blog-posts'
    );
    expect(resolveBlogPostTemplateIdFromThemeConfig(config, 'other', 'welcome')).toBe(
      'blog-posts'
    );
  });
});
