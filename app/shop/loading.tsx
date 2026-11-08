/**
 * /shop skeleton: mirrors the catalog grid (header block + 1/2/3-column
 * card grid with a 4:5 image box, title line, price line) so the swap-in
 * is shape-identical to the loaded page.
 */

const SKELETON_CARD_COUNT = 6;

export default function ShopLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--page-bg)] text-[var(--text-primary)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(216,187,124,0.28),transparent_45%)]" />

      <main
        aria-busy="true"
        aria-label="Loading the catalog"
        className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16 pb-24 lg:px-8"
      >
        <div className="mx-auto w-full max-w-5xl space-y-3">
          <div className="h-3 w-24 animate-pulse rounded-full bg-[rgba(189,188,178,0.12)]" />
          <div className="mx-auto h-9 w-2/3 animate-pulse rounded-full bg-[rgba(189,188,178,0.12)] lg:mx-0" />
          <div className="mx-auto h-4 w-1/2 animate-pulse rounded-full bg-[rgba(189,188,178,0.12)] lg:mx-0" />
        </div>

        <ul className="mt-12 grid list-none gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
            <li
              key={index}
              className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg-light)] p-5"
            >
              <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-[rgba(189,188,178,0.12)]" />
              <div className="mt-5 h-5 w-2/3 animate-pulse rounded-full bg-[rgba(189,188,178,0.12)]" />
              <div className="mt-3 h-4 w-1/3 animate-pulse rounded-full bg-[rgba(189,188,178,0.12)]" />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
