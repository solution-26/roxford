/**
 * Bandeau défilant des spécialités. Animation purement CSS (aucun JS),
 * dupliquée une fois pour que la boucle soit invisible. Se fige au survol.
 */
export function Marquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <div className="marquee-host no-print relative overflow-hidden border-y border-walnut-deep/25 bg-walnut py-4">
      <div className="fade-edges flex">
        <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10">
          {loop.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="flex shrink-0 items-center gap-10 font-display text-lg tracking-wide text-sand whitespace-nowrap"
            >
              {item}
              <span
                aria-hidden
                className="h-1.5 w-1.5 rotate-45 bg-brass"
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
