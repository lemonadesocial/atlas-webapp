import { STRINGS } from "@/lib/utils/constants";

export function ForAttendees() {
  return (
    <section className="bg-card/50 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-display text-3xl font-bold text-primary">
          {STRINGS.forAttendeesTitle}
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {STRINGS.forAttendeesProps.map((prop, i) => (
            <div
              key={i}
              className="rounded-lg border border-card-border bg-card p-6 backdrop-blur-lg"
            >
              <p className="text-center text-secondary">{prop}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
