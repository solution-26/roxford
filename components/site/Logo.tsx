import Image from "next/image";

/**
 * Logo de repli : un monogramme « hublot » dessiné en SVG, qui reprend
 * le motif des fenêtres rondes de la salle. Dès qu'un logo est téléversé
 * depuis l'administration, il remplace ce dessin.
 */
export function Logo({
  name,
  logoUrl,
  size = 40,
  tone = "dark",
}: {
  name: string;
  logoUrl?: string | null;
  size?: number;
  tone?: "dark" | "light";
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        unoptimized
      />
    );
  }

  const ring = tone === "light" ? "#d8bd8d" : "#b08d57";
  const glass = tone === "light" ? "#1f5b59" : "#2e7d7b";
  const letter = name.trim().charAt(0).toUpperCase() || "R";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={name}
      className="shrink-0"
    >
      <circle cx="24" cy="24" r="23" fill={glass} />
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="none"
        stroke={ring}
        strokeWidth="3"
      />
      <circle
        cx="24"
        cy="24"
        r="17"
        fill="none"
        stroke={ring}
        strokeWidth="1"
        opacity="0.55"
      />
      {/* Les quatre rivets du hublot */}
      {[0, 90, 180, 270].map((deg) => (
        <circle
          key={deg}
          cx={24 + 19.5 * Math.cos((deg * Math.PI) / 180)}
          cy={24 + 19.5 * Math.sin((deg * Math.PI) / 180)}
          r="1.6"
          fill={ring}
        />
      ))}
      <text
        x="24"
        y="24"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fbf6ee"
        fontFamily="Georgia, serif"
        fontSize="20"
        fontWeight="600"
      >
        {letter}
      </text>
    </svg>
  );
}
