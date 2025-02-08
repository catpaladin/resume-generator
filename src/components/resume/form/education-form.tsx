import { Education } from "@/types/resume";
import { Card } from "@/components/ui/card";
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
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Education</h3>
      <div className="space-y-4">
        {education.map((edu) => (
          <div key={edu.id} className="p-4 border rounded-lg">
            <div className="flex gap-4">
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  placeholder="School"
                  value={edu.school}
                  onChange={(e) =>
                    updateEducation(edu.id, "school", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-md border-input bg-background"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) =>
                      updateEducation(edu.id, "degree", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md border-input bg-background"
                  />
                  <input
                    type="text"
                    placeholder="Graduation Year"
                    value={edu.graduationYear}
                    onChange={(e) =>
                      updateEducation(edu.id, "graduationYear", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md border-input bg-background"
                  />
                </div>
              </div>
              <button
                onClick={() => removeEducation(edu.id)}
                className="p-2 text-muted-foreground hover:text-destructive"
                aria-label="Remove education"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={addEducation}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
      >
        <Plus size={16} />
        Add Education
      </button>
    </Card>
  );
}
