/** Hero title whose words rise into place one after another (static when the visitor prefers reduced motion). */
export function AnimatedTitle({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <h1 className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]">
          <span className="hero-word inline-block" style={{ animationDelay: `${120 + i * 110}ms` }}>
            {word}
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </h1>
  );
}
