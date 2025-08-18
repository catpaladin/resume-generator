import type { PersonalInfo } from "@/types/resume";

interface HeaderSectionProps {
  data: PersonalInfo;
}

export function HeaderSection({ data }: HeaderSectionProps) {
  if (!data) {
    return null;
  }

  const { fullName, location, email, phone, linkedin, summary } = data;

  // Filter out empty or undefined contact info
  const contactInfo = [location, email, phone, linkedin].filter(Boolean);

  return (
    <section className="space-y-2 text-center">
      <h1 className="text-foreground text-2xl font-bold">{fullName}</h1>

      {contactInfo.length > 0 && (
        <p className="text-muted-foreground text-sm">
          {contactInfo.join(" • ")}
        </p>
      )}

      {summary && (
        <div className="mt-4 text-left">
          <h2 className="text-foreground mb-1 text-base font-semibold">
            Professional Summary
          </h2>
          <p className="text-muted-foreground text-sm">{summary}</p>
        </div>
      )}
    </section>
  );
}
