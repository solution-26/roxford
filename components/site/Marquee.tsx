/**
 * Bandeau défilant des plats mis en avant. Animation purement CSS,
 * dupliquée une fois pour que la boucle soit invisible. Se fige au
 * survol, pour qu'on puisse lire.
 */
export function Marquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <div className="marquee-host no-print relative overflow-hidden border-y border-gold/20 bg-wood-deep py-3.5">
      <div className="fade-edges flex">
        <div className="animate-marquee flex shrink-0 items-center gap-8 pr-8">
          {loop.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="flex shrink-0 items-center gap-8 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.26em] text-cream-dim/70"
            >
              {item}
              <span aria-hidden className="h-1 w-1 rotate-45 bg-gold" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
