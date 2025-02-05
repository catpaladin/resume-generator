import type { PersonalInfo } from '@/types/resume';

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
      <h1 className="text-2xl font-bold text-foreground">
        {fullName || 'Your Name'}
      </h1>

      {contactInfo.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {contactInfo.join(' • ')}
        </p>
      )}

      {summary && (
        <div className="mt-4 text-left">
          <h2 className="text-base font-semibold mb-1 text-foreground">
            Professional Summary
          </h2>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>
      )}
    </section>
  );
}
