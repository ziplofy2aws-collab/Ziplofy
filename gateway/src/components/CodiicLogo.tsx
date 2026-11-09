type Props = { className?: string };

/** Official logo — rendered as-is. */
export default function CodiicLogo({ className = '' }: Props) {
  return (
    <div className={`codiic-logo ${className}`.trim()}>
      <img
        className="codiic-logo__img"
        src="/logo_with_text.webp"
        alt="CODIIC"
        decoding="async"
      />
    </div>
  );
}
