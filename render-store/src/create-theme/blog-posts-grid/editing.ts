import type { CreateThemeEditing } from '../types';

export const editing: CreateThemeEditing = {
  "sectionLabel": "Blog posts: Grid",
  "sectionSettingsOrder": [
    {
      "key": "heading",
      "label": "Heading",
      "type": "text"
    },
    {
      "key": "blogHandle",
      "label": "Blog",
      "type": "text"
    },
    {
      "key": "layoutType",
      "label": "Type",
      "type": "text"
    },
    {
      "key": "carouselOnMobile",
      "label": "Carousel on mobile",
      "type": "boolean"
    },
    {
      "key": "postCount",
      "label": "Post count",
      "type": "number"
    },
    {
      "key": "columns",
      "label": "Columns",
      "type": "number"
    },
    {
      "key": "mobileColumns",
      "label": "Mobile columns",
      "type": "text"
    },
    {
      "key": "horizontalGap",
      "label": "Horizontal gap",
      "type": "number"
    },
    {
      "key": "verticalGap",
      "label": "Vertical gap",
      "type": "number"
    },
    {
      "key": "sectionWidth",
      "label": "Width",
      "type": "text"
    },
    {
      "key": "layoutGap",
      "label": "Gap",
      "type": "number"
    },
    {
      "key": "colorScheme",
      "label": "Color scheme",
      "type": "text"
    },
    {
      "key": "paddingTop",
      "label": "Top",
      "type": "number"
    },
    {
      "key": "paddingBottom",
      "label": "Bottom",
      "type": "number"
    },
    {
      "key": "customCss",
      "label": "Custom CSS",
      "type": "textarea"
    }
  ],
  "blocks": [
    {
      "blockId": "blog_post_card",
      "label": "Blog post",
      "settingsOrder": [
        {
          "key": "illustrationVariant",
          "label": "Illustration",
          "type": "text"
        },
        {
          "key": "title",
          "label": "Title",
          "type": "text"
        },
        {
          "key": "date",
          "label": "Date",
          "type": "text"
        },
        {
          "key": "author",
          "label": "Author",
          "type": "text"
        },
        {
          "key": "excerpt",
          "label": "Excerpt",
          "type": "textarea"
        },
        {
          "key": "imageUrl",
          "label": "Image URL",
          "type": "text"
        }
      ]
    }
  ]
};
