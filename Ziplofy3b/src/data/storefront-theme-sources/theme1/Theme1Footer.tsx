export function Theme1Footer({ storeName }: { storeName: string }) {
  return (
    <footer className="border-t border-slate-200 bg-white/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-xs text-slate-500">
        <span>{storeName}</span>
        <span>theme1</span>
      </div>
    </footer>
  );
}
