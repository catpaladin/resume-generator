import type { PersonalInfo } from '@/types/resume';
import { Card } from '@/components/ui/card';

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (field: keyof PersonalInfo, value: string) => void;
}

export function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  // Add a guard clause to handle undefined data
  if (!data) {
    return null;
  }

  const { fullName, location, email, phone, linkedin, summary } = data;

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Personal Information</h3>
      <div className="grid gap-3">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
          className="w-full px-3 py-2 border rounded-md border-input bg-background"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => onChange('location', e.target.value)}
            className="w-full px-3 py-2 border rounded-md border-input bg-background"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => onChange('email', e.target.value)}
            className="w-full px-3 py-2 border rounded-md border-input bg-background"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className="w-full px-3 py-2 border rounded-md border-input bg-background"
          />
          <input
            type="url"
            placeholder="LinkedIn URL"
            value={linkedin}
            onChange={(e) => onChange('linkedin', e.target.value)}
            className="w-full px-3 py-2 border rounded-md border-input bg-background"
          />
        </div>
        <textarea
          placeholder="Professional Summary"
          value={summary}
          onChange={(e) => onChange('summary', e.target.value)}
          className="w-full px-3 py-2 border rounded-md border-input bg-background min-h-[100px] resize-y"
        />
      </div>
    </Card>
  );
}
