import type { PersonalInfo } from "@/types/resume";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { TextInput, TextArea } from "@/components/ui/input";
import { User } from "lucide-react";

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
    <Card className="border-gradient-to-br from-primary/10 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User size={20} className="text-primary" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Your professional identity • Keep it concise and impactful
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <TextInput
            label="Full Name"
            placeholder="e.g., Taylor Morgan"
            value={fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput
              label="Location"
              placeholder="City, Country"
              value={location}
              onChange={(e) => onChange("location", e.target.value)}
            />
            <TextInput
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => onChange("email", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput
              type="tel"
              label="Phone"
              placeholder="e.g., +1 555 123 4567"
              value={phone}
              onChange={(e) => onChange("phone", e.target.value)}
            />
            <TextInput
              type="url"
              label="LinkedIn URL"
              placeholder="https://linkedin.com/in/username"
              value={linkedin}
              onChange={(e) => onChange("linkedin", e.target.value)}
            />
          </div>
          <TextArea
            label="Professional Summary"
            placeholder="2–3 lines highlighting your impact and strengths"
            value={summary}
            onChange={(e) => onChange("summary", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
