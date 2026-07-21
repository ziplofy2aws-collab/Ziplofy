import { describe, expect, it } from 'vitest';
import {
  resolveCollectionTemplateIdFromThemeConfig,
  writeCollectionTemplateAssignments,
} from './collection-templates.util';

function configFixture(): Record<string, unknown> {
  return {
    templates: {
      collection: {
        name: 'Default collection',
        sections: {},
        section_order: [],
      },
      'collection.featured': {
        name: 'Featured',
        sections: {},
        section_order: [],
      },
    },
    collection_template_order: ['collection', 'collection.featured'],
  };
}

describe('collection template assignments', () => {
  it('writes handle assignments and updates counts', () => {
    const config = configFixture();

    writeCollectionTemplateAssignments(config, {
      catalog: 'default',
      featured: 'collection.featured',
    });

    expect(config.collection_template_assignments).toEqual({
      catalog: 'default',
      featured: 'collection.featured',
    });
    const templates = config.templates as Record<string, Record<string, unknown>>;
    expect(templates.collection.assignedCollectionCount).toBe(1);
    expect(templates['collection.featured'].assignedCollectionCount).toBe(1);
  });

  it('resolves an alternate template from the loaded theme JSON', () => {
    const config = configFixture();
    writeCollectionTemplateAssignments(config, {
      featured: 'collection.featured',
    });

    expect(resolveCollectionTemplateIdFromThemeConfig(config, 'FEATURED')).toBe(
      'collection.featured'
    );
  });

  it('falls back when an assignment or template is missing', () => {
    const config = configFixture();
    writeCollectionTemplateAssignments(config, {
      archived: 'collection.deleted',
    });

    expect(resolveCollectionTemplateIdFromThemeConfig(config, 'unassigned')).toBe('collection');
    expect(resolveCollectionTemplateIdFromThemeConfig(config, 'archived')).toBe('collection');
  });
});
