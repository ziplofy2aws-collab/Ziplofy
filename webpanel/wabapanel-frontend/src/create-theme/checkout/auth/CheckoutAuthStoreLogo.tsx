import type { CheckoutLogoPreviewConfig } from '../preview/CheckoutHeaderRuntimePreview';

export function CheckoutAuthStoreLogo({
  storeName,
  logo,
  headingsFontFamily,
}: {
  storeName: string;
  logo?: CheckoutLogoPreviewConfig;
  headingsFontFamily?: string;
}) {
  const image = logo?.image?.trim();
  const width = logo?.width ?? 50;
  const alignment = logo?.alignment ?? 'center';
  const alignClass =
    alignment === 'left' ? 'mr-auto' : alignment === 'right' ? 'ml-auto' : 'mx-auto';
  const textAlignClass =
    alignment === 'left' ? 'text-left' : alignment === 'right' ? 'text-right' : 'text-center';

  if (image) {
    return (
      <img
        src={image}
        alt={storeName}
        className={`block h-auto max-w-full object-contain ${alignClass}`}
        style={{ width: `${width}px` }}
      />
    );
  }

  return (
    <p
      className={`text-[22px] font-semibold tracking-[-0.02em] text-[#121212] ${textAlignClass}`}
      style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
    >
      {storeName}
    </p>
  );
}
