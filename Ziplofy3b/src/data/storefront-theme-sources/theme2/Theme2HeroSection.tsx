export function Theme2HeroSection({
  storeName,
  description,
}: {
  storeName: string;
  description?: string;
}) {
  return (
    <section className="border-b-4 border-black bg-[#FFEB00] p-4 sm:p-6" aria-label="Hero section">
      <div className="inline-block border-4 border-black bg-black px-3 py-1 text-[10px] font-bold text-[#FFEB00]">HERO SECTION</div>
      <h1 className="mt-4 max-w-[95vw] wrap-break-word text-[clamp(2.5rem,12vw,7rem)] font-black uppercase leading-[0.85] tracking-tighter">
        {storeName}
      </h1>
      {description ? (
        <p className="mt-6 max-w-2xl border-l-4 border-black pl-4 text-sm font-bold uppercase leading-snug sm:text-base">{description}</p>
      ) : (
        <p className="mt-6 text-sm font-bold uppercase opacity-60">NO_DESCRIPTION_FIELD</p>
      )}
    </section>
  );
}
