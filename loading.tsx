export default function Loading() {
  return (
    <div className="flex items-center justify-center py-32 text-gold-400">
      <div className="h-8 w-8 rounded-full border-2 border-gold-500/30 border-t-gold-400 animate-spin" />
      <span className="ml-3 text-sm tracking-widest uppercase">A carregar…</span>
    </div>
  );
}
