import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SlantedImageCarouselWrapper from './SlantedImageCarouselWrapper';

describe('SlantedImageCarouselWrapper', () => {
  it('renders children in foreground content container', () => {
    render(
      <SlantedImageCarouselWrapper images={['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg', 'e.jpg', 'f.jpg']}>
        <div>Child content</div>
      </SlantedImageCarouselWrapper>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('splits images into 6 columns and duplicates for seamless loop (3x)', () => {
    const images = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'];
    const { container } = render(
      <SlantedImageCarouselWrapper images={images}>
        <div>Child</div>
      </SlantedImageCarouselWrapper>
    );

    // Each column gets one image, duplicated 3x => total <img> tags = images.length * 3
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBe(images.length * 3);
  });

  it('injects keyframe style tag (scrollUp/scrollDown)', () => {
    const { container } = render(
      <SlantedImageCarouselWrapper images={['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg']}>
        <div>Child</div>
      </SlantedImageCarouselWrapper>
    );

    const style = Array.from(container.querySelectorAll('style')).map((s) => s.textContent ?? '').join('\n');
    expect(style).toContain('@keyframes scrollUp');
    expect(style).toContain('@keyframes scrollDown');
  });
  
  it('renders default images when no images prop is provided', () => {
    const { container } = render(
      <SlantedImageCarouselWrapper>
        <div>Content</div>
      </SlantedImageCarouselWrapper>
    );

    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBeGreaterThan(0);
  });

  it('renders custom images when provided', () => {
    const images = ['https://example.com/a.jpg', 'https://example.com/b.jpg'];

    const { container } = render(
      <SlantedImageCarouselWrapper images={images}>
        <div>Content</div>
      </SlantedImageCarouselWrapper>
    );

    const imgs = Array.from(container.querySelectorAll('img'));
    const srcs = imgs.map((img) => (img as HTMLImageElement).src);
    expect(srcs.some((s) => s.includes('a.jpg'))).toBe(true);
    expect(srcs.some((s) => s.includes('b.jpg'))).toBe(true);
  });
});

