export default function SomaticField({ size = 8 }) {
  const cells = Array.from({ length: size * size });
  return (
    <div>
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {cells.map((_, i) => {
          const row = Math.floor(i / size);
          const col = i % size;
          const cx = (size - 1) / 2;
          const dist = Math.sqrt((row - cx) ** 2 + (col - cx) ** 2);
          const maxDist = Math.sqrt(2) * cx;
          const norm = dist / maxDist;
          const delay = (norm * 1400 + Math.random() * 400);
          return (
            <div
              key={i}
              className="aspect-square hw-somatic-cell"
              style={{ animationDelay: `${delay}ms` }}
            />
          );
        })}
      </div>
    </div>
  );
}