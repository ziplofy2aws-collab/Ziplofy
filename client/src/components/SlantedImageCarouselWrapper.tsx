import React, { useMemo } from 'react';

interface SlantedImageCarouselWrapperProps {
  children: React.ReactNode;
  images?: string[];
}

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop',
];

const SlantedImageCarouselWrapper: React.FC<SlantedImageCarouselWrapperProps> = ({
  children,
  images = DEFAULT_IMAGES,
}) => {
  const columns = useMemo(() => {
    // 6 columns to fill the screen
    const cols: string[][] = [[], [], [], [], [], []];
    images.forEach((img, i) => {
      cols[i % 6].push(img);
    });
    // Duplicate for seamless loop
    return cols.map(col => [...col, ...col, ...col]);
  }, [images]);

  return (
    <>
      <style>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-33.33%); }
        }
        @keyframes scrollDown {
          0% { transform: translateY(-33.33%); }
          100% { transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="relative h-screen w-screen overflow-hidden bg-gray-900">
        {/* Image Grid Background - Full Width */}
        <div className="absolute inset-0 flex gap-3">
          {columns.map((column, colIndex) => (
            <div
              key={colIndex}
              className="flex-1 min-w-0"
              style={{
                animation: `${colIndex % 2 === 0 ? 'scrollUp' : 'scrollDown'} ${35 + colIndex * 3}s linear infinite`,
              }}
            >
              <div className="flex flex-col gap-3">
                {column.map((img, imgIndex) => (
                  <div
                    key={`${colIndex}-${imgIndex}`}
                    className="w-full aspect-[3/4] rounded-xl overflow-hidden"
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Dark overlay tint */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Subtle blur on images */}
        <div className="absolute inset-0 backdrop-blur-[1px]" />

        {/* Dark edge fades */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-screen flex items-center justify-center overflow-hidden">
          <div className="relative w-full max-w-md mx-auto px-4 py-4 max-h-[95vh] overflow-y-auto scrollbar-hide">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default SlantedImageCarouselWrapper;
