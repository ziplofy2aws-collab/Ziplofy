import { describe, expect, it } from 'vitest';
import {
  resolveProductTemplateIdFromThemeConfig,
  writeProductTemplateAssignments,
} from './product-templates.util';

function configFixture(): Record<string, unknown> {
  return {
    templates: {
      product: {
        name: 'Default product',
        sections: {},
        section_order: [],
      },
      'product.featured': {
        name: 'Featured',
        sections: {},
        section_order: [],
      },
    },
    product_template_order: ['product', 'product.featured'],
  };
}

describe('product template assignments', () => {
  it('writes handle assignments and updates counts', () => {
    const config = configFixture();

    writeProductTemplateAssignments(config, {
      'basic-shirt': 'default',
      'featured-shirt': 'product.featured',
    });

    expect(config.product_template_assignments).toEqual({
      'basic-shirt': 'default',
      'featured-shirt': 'product.featured',
    });
    const templates = config.templates as Record<string, Record<string, unknown>>;
    expect(templates.product.assignedProductCount).toBe(1);
    expect(templates['product.featured'].assignedProductCount).toBe(1);
  });

  it('resolves an alternate template from the loaded theme JSON', () => {
    const config = configFixture();
    writeProductTemplateAssignments(config, {
      'featured-shirt': 'product.featured',
    });

    expect(resolveProductTemplateIdFromThemeConfig(config, 'FEATURED-SHIRT')).toBe(
      'product.featured'
    );
  });

  it('falls back to the default when an assignment or template is missing', () => {
    const config = configFixture();
    writeProductTemplateAssignments(config, {
      'missing-template-shirt': 'product.deleted',
    });

    expect(resolveProductTemplateIdFromThemeConfig(config, 'unassigned-shirt')).toBe('product');
    expect(resolveProductTemplateIdFromThemeConfig(config, 'missing-template-shirt')).toBe(
      'product'
    );
  });
});
