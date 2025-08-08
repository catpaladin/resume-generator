import { Education } from "@/types/resume";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { TextInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { IconButton } from "@/components/ui/button/icon-button";
import { Plus, X } from "lucide-react";

interface EducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

export function EducationForm({ education, onChange }: EducationFormProps) {
  const addEducation = () => {
    onChange([
      ...education,
      {
        id: crypto.randomUUID(),
        school: "",
        degree: "",
        graduationYear: "",
      },
    ]);
  };

  const removeEducation = (id: string) => {
    onChange(education.filter((edu) => edu.id !== id));
  };

  const updateEducation = (
    id: string,
    field: keyof Education,
    value: string,
  ) => {
    onChange(
      education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu,
      ),
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
        <CardDescription>
          List your most relevant education. Include degree and graduation
          year.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {education.map((edu) => (
          <div key={edu.id} className="rounded-lg border p-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-3">
                <TextInput
                  label="School"
                  placeholder="e.g., University of Somewhere"
                  value={edu.school}
                  onChange={(e) =>
                    updateEducation(edu.id, "school", e.target.value)
                  }
                />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <TextInput
                    label="Degree"
                    placeholder="e.g., B.Sc. Computer Science"
                    value={edu.degree}
                    onChange={(e) =>
                      updateEducation(edu.id, "degree", e.target.value)
                    }
                  />
                  <TextInput
                    label="Graduation Year"
                    placeholder="e.g., 2024"
                    value={edu.graduationYear}
                    onChange={(e) =>
                      updateEducation(edu.id, "graduationYear", e.target.value)
                    }
                  />
                </div>
              </div>
              <IconButton
                variant="ghost"
                aria-label="Remove education"
                icon={<X size={18} />}
                onClick={() => removeEducation(edu.id)}
              />
            </div>
          </div>
        ))}
        <div>
          <Button type="button" variant="link" className="px-0" onClick={addEducation}>
            <Plus size={16} className="mr-2" /> Add Education
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
