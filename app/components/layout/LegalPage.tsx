/** Platzhalter-Layout für Rechtstexte (Inhalte vor Livegang durch geprüfte Texte ersetzen). */
export function LegalPage({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <article className="mx-auto max-w-3xl px-4 pt-[calc(var(--header-h)+5rem)] pb-32 md:px-10">
      <p className="label flex items-center gap-4 text-bone/60">
        <span className="rule-orange" /> Rechtliches
      </p>
      <h1 className="display mt-6 text-5xl md:text-7xl">{title}</h1>
      <div className="mt-6 border border-orange/40 bg-orange/10 p-4 text-sm text-bone/80">
        Platzhalter – dieser Text ist noch nicht rechtlich geprüft und muss vor dem Livegang ersetzt werden.
      </div>
      <div className="mt-10 space-y-6 leading-relaxed text-bone/75 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-bone">
        {children}
      </div>
    </article>
  );
}
