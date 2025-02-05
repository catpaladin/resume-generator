import { Skill } from '@/types/resume';
import { Card } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';

interface SkillsFormProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

export function SkillsForm({ skills, onChange }: SkillsFormProps) {
  const addSkill = () => {
    onChange([...skills, { id: crypto.randomUUID(), name: '' }]);
  };

  const removeSkill = (id: string) => {
    onChange(skills.filter(skill => skill.id !== id));
  };

  const updateSkill = (id: string, name: string) => {
    onChange(skills.map(skill =>
      skill.id === id ? { ...skill, name } : skill
    ));
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Skills</h3>
      <div className="space-y-2">
        {skills.map((skill) => (
          <div key={skill.id} className="flex gap-2">
            <input
              type="text"
              placeholder="Skill (e.g., JavaScript, Project Management)"
              value={skill.name}
              onChange={(e) => updateSkill(skill.id, e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md border-input bg-background"
            />
            <button
              onClick={() => removeSkill(skill.id)}
              className="p-2 text-muted-foreground hover:text-destructive"
              aria-label="Remove skill"
            >
              <X size={20} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addSkill}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
      >
        <Plus size={16} />
        Add Skill
      </button>
    </Card>
  );
}
