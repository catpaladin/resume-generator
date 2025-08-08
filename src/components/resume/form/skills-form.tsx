import { Skill } from "@/types/resume";
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

interface SkillsFormProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

export function SkillsForm({ skills, onChange }: SkillsFormProps) {
  const addSkill = () => {
    onChange([...skills, { id: crypto.randomUUID(), name: "", category: "" }]);
  };

  const removeSkill = (id: string) => {
    onChange(skills.filter((skill) => skill.id !== id));
  };

  const updateSkill = (
    id: string,
    updatedField: Partial<Omit<Skill, "id">>,
  ) => {
    onChange(
      skills.map((skill) =>
        skill.id === id ? { ...skill, ...updatedField } : skill,
      ),
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>
          Organize skills by category. Unlabeled skills will appear under
          &quot;General Skills&quot; in the preview and export.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="grid grid-cols-1 items-start gap-3 md:grid-cols-2"
            >
              <TextInput
                label="Skill"
                placeholder="e.g., JavaScript"
                value={skill.name}
                onChange={(e) =>
                  updateSkill(skill.id, { name: e.target.value })
                }
              />
              <div className="flex items-end gap-2">
                <TextInput
                  label="Category"
                  placeholder="e.g., Programming Languages"
                  value={skill.category || ""}
                  onChange={(e) =>
                    updateSkill(skill.id, { category: e.target.value })
                  }
                  className="flex-1"
                />
                <IconButton
                  variant="ghost"
                  aria-label="Remove skill"
                  icon={<X size={18} />}
                  onClick={() => removeSkill(skill.id)}
                />
              </div>
            </div>
          ))}
        </div>
        <div>
          <Button
            type="button"
            variant="link"
            className="px-0"
            onClick={addSkill}
          >
            <Plus size={16} className="mr-2" /> Add Skill
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
