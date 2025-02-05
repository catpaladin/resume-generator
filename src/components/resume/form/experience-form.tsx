import { Experience, BulletPoint } from '@/types/resume';
import { Card } from '@/components/ui/card';
import { Plus, X, GripVertical } from 'lucide-react';

interface ExperienceFormProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
}

export function ExperienceForm({ experiences, onChange }: ExperienceFormProps) {
  const addExperience = () => {
    onChange([
      ...experiences,
      {
        id: crypto.randomUUID(),
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        bulletPoints: [{ id: crypto.randomUUID(), text: '' }]
      }
    ]);
  };

  const removeExperience = (id: string) => {
    onChange(experiences.filter(exp => exp.id !== id));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    onChange(experiences.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const addBulletPoint = (experienceId: string) => {
    onChange(experiences.map(exp =>
      exp.id === experienceId
        ? {
            ...exp,
            bulletPoints: [...exp.bulletPoints, { id: crypto.randomUUID(), text: '' }]
          }
        : exp
    ));
  };

  const updateBulletPoint = (experienceId: string, bulletId: string, text: string) => {
    onChange(experiences.map(exp =>
      exp.id === experienceId
        ? {
            ...exp,
            bulletPoints: exp.bulletPoints.map(bullet =>
              bullet.id === bulletId ? { ...bullet, text } : bullet
            )
          }
        : exp
    ));
  };

  const removeBulletPoint = (experienceId: string, bulletId: string) => {
    onChange(experiences.map(exp =>
      exp.id === experienceId
        ? {
            ...exp,
            bulletPoints: exp.bulletPoints.filter(bullet => bullet.id !== bulletId)
          }
        : exp
    ));
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Experience</h3>
      <div className="space-y-6">
        {experiences.map((exp) => (
          <div key={exp.id} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-4">
                <input
                  type="text"
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md border-input bg-background"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Position"
                    value={exp.position}
                    onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md border-input bg-background"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={exp.location}
                    onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md border-input bg-background"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Start Date"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md border-input bg-background"
                  />
                  <input
                    type="text"
                    placeholder="End Date"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md border-input bg-background"
                  />
                </div>
              </div>
              <button
                onClick={() => removeExperience(exp.id)}
                className="p-2 text-muted-foreground hover:text-destructive"
                aria-label="Remove experience"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Bullet Points</h4>
              {exp.bulletPoints.map((bullet) => (
                <div key={bullet.id} className="flex gap-2 items-center">
                  <GripVertical size={16} className="text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Describe your achievement or responsibility"
                    value={bullet.text}
                    onChange={(e) => updateBulletPoint(exp.id, bullet.id, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md border-input bg-background"
                  />
                  <button
                    onClick={() => removeBulletPoint(exp.id, bullet.id)}
                    className="p-2 text-muted-foreground hover:text-destructive"
                    aria-label="Remove bullet point"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addBulletPoint(exp.id)}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
              >
                <Plus size={16} />
                Add Bullet Point
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={addExperience}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
      >
        <Plus size={16} />
        Add Experience
      </button>
    </Card>
  );
}
