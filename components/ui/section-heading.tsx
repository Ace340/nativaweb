"use client";

type SectionHeadingProps = {
  label: string;
  title: string;
  description?: string;
};

export function SectionHeading({
  label,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-2 text-center lg:text-left">
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--color-gold)]">
        {label}
      </p>
      <h2 className="text-3xl font-semibold leading-tight text-[var(--text-primary)] md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-base text-[var(--text-muted)] md:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
