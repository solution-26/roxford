import Image from "next/image";

/**
 * Marque Roxford.
 *
 * Reprise du logo du restaurant : un écusson hexagonal monochrome avec
 * couverts croisés. Aux tailles d'affichage (34–52 px) le texte du logo
 * d'origine serait illisible ; on ne garde donc que l'écusson et les
 * couverts, le mot « Roxford » étant posé à côté dans la même serif.
 *
 * Dessiné en SVG plutôt qu'importé : net à toute taille, et la version
 * claire sur fond sombre ne demande qu'un échange de deux couleurs.
 * Dès qu'un logo est téléversé depuis l'administration, il prend le relais.
 */
export function Logo({
  name,
  logoUrl,
  size = 40,
  tone = "dark",
}: {
  name: string;
  logoUrl?: string | null;
  /** Hauteur en pixels. La largeur suit le rapport de l'écusson (4/3). */
  size?: number;
  /** « dark » : écusson sombre sur fond clair. « light » : l'inverse. */
  tone?: "dark" | "light";
}) {
  if (logoUrl) {
    // object-contain, sans arrondi : un écusson hexagonal ne doit pas
    // être rogné en cercle.
    return (
      <Image
        src={logoUrl}
        alt={name}
        width={Math.round(size * 1.6)}
        height={size}
        className="w-auto object-contain"
        style={{ height: size }}
        unoptimized
      />
    );
  }

  const badge = tone === "light" ? "#fbf6ee" : "#201914";
  const mark = tone === "light" ? "#201914" : "#fbf6ee";

  return (
    <svg
      width={Math.round((size * 4) / 3)}
      height={size}
      viewBox="0 0 48 36"
      role="img"
      aria-label={name}
      className="shrink-0"
    >
      {/* Écusson : hexagone pointé en haut et en bas */}
      <path
        d="M24 1.5 L46 10 L46 26 L24 34.5 L2 26 L2 10 Z"
        fill={badge}
      />
      {/* Filet intérieur, comme sur le logo imprimé */}
      <path
        d="M24 4.4 L43.2 11.8 L43.2 24.2 L24 31.6 L4.8 24.2 L4.8 11.8 Z"
        fill="none"
        stroke={mark}
        strokeWidth="0.7"
        opacity="0.85"
      />

      <g
        stroke={mark}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Couteau : manche en diagonale, lame pleine */}
        <path d="M18.6 24 L23.6 18.6" />
        <path
          d="M23.4 18.8 C25.2 16.2 27.4 13.4 28.8 12.2 C29.6 14.2 28.2 17.2 26 19.6 Z"
          fill={mark}
          strokeWidth="1"
        />
        {/* Fourchette : trois dents puis le manche */}
        <path d="M19.4 12.2 L20.6 16.2" />
        <path d="M21.8 11.6 L21.9 15.8" />
        <path d="M24.2 12.2 L23.1 16.2" />
        <path d="M20.6 16.2 C20.9 17.6 21.6 18.3 22.4 18.6 L29.4 24" />
      </g>
    </svg>
  );
}
