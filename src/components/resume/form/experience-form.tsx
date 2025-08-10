import { useState } from "react";
import { Experience } from "@/types/resume";
import { useResumeStore } from "@/store/resumeStore";
import { createAIService } from "@/services/aiService";
import { AIConfirmationModal } from "@/components/ui/ai-confirmation-modal";
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
import { SortableItem } from "@/components/ui/sortable-item";
import {
  Plus,
  X,
  Briefcase,
  Sparkles,
  FileText,
  Loader2,
  Settings,
} from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface ExperienceFormProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
  onNavigateToAISettings?: () => void;
}

export function ExperienceForm({
  experiences,
  onChange,
  onNavigateToAISettings,
}: ExperienceFormProps) {
  const { aiSettings } = useResumeStore();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {},
  );
  const [showJobDescription, setShowJobDescription] = useState<
    Record<string, boolean>
  >({});
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    originalText: string;
    enhancedText: string;
    experienceId: string;
    bulletId: string;
  } | null>(null);
  const [isRefining, setIsRefining] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      location: "",
      jobDescription: "",
      bulletPoints: [
        {
          id: Date.now().toString() + "-1",
          text: "",
        },
      ],
    };
    onChange([...experiences, newExperience]);
  };

  const removeExperience = (id: string) => {
    onChange(experiences.filter((exp) => exp.id !== id));
  };

  const updateExperience = (
    id: string,
    field: keyof Experience,
    value: string | boolean,
  ) => {
    onChange(
      experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp,
      ),
    );
  };

  const addBulletPoint = (experienceId: string) => {
    onChange(
      experiences.map((exp) =>
        exp.id === experienceId
          ? {
              ...exp,
              bulletPoints: [
                ...exp.bulletPoints,
                {
                  id: Date.now().toString(),
                  text: "",
                },
              ],
            }
          : exp,
      ),
    );
  };

  const updateBulletPoint = (
    experienceId: string,
    bulletId: string,
    text: string,
  ) => {
    onChange(
      experiences.map((exp) =>
        exp.id === experienceId
          ? {
              ...exp,
              bulletPoints: exp.bulletPoints.map((bullet) =>
                bullet.id === bulletId ? { ...bullet, text } : bullet,
              ),
            }
          : exp,
      ),
    );
  };

  const removeBulletPoint = (experienceId: string, bulletId: string) => {
    onChange(
      experiences.map((exp) =>
        exp.id === experienceId
          ? {
              ...exp,
              bulletPoints: exp.bulletPoints.filter(
                (bullet) => bullet.id !== bulletId,
              ),
            }
          : exp,
      ),
    );
  };

  const enhanceBulletPoint = async (experienceId: string, bulletId: string) => {
    const experience = experiences.find((exp) => exp.id === experienceId);
    if (!experience) return;

    const bulletPoint = experience.bulletPoints.find(
      (bp) => bp.id === bulletId,
    );
    if (!bulletPoint) return;

    // Set loading state
    setLoadingStates((prev) => ({
      ...prev,
      [`${experienceId}-${bulletId}`]: true,
    }));

    try {
      const aiService = createAIService(aiSettings || { provider: "openai" }); // TODO: Implement proper API key handling

      // Get other bullet points in the same experience for context
      const otherBulletPoints = experience.bulletPoints
        .filter((bp) => bp.id !== bulletId && bp.text.trim())
        .map((bp) => bp.text);

      const enhancedText = await aiService.summarizeAndEnhance(
        bulletPoint.text,
        {
          company: experience.company,
          position: experience.position,
        },
        "concise",
        otherBulletPoints,
      );

      // Show confirmation modal
      setConfirmationModal({
        isOpen: true,
        originalText: bulletPoint.text,
        enhancedText,
        experienceId,
        bulletId,
      });
    } catch (error) {
      console.error("Error enhancing bullet point:", error);
      // Reset loading state on error
      setLoadingStates((prev) => ({
        ...prev,
        [`${experienceId}-${bulletId}`]: false,
      }));
    }
  };

  const handleAcceptEnhancement = () => {
    if (!confirmationModal) return;

    const { experienceId, bulletId, enhancedText } = confirmationModal;
    updateBulletPoint(experienceId, bulletId, enhancedText);

    // Reset loading state and close modal
    setLoadingStates((prev) => ({
      ...prev,
      [`${experienceId}-${bulletId}`]: false,
    }));
    setConfirmationModal(null);
  };

  const handleRejectEnhancement = () => {
    if (!confirmationModal) return;

    const { experienceId, bulletId } = confirmationModal;
    // Just reset loading state and close modal
    setLoadingStates((prev) => ({
      ...prev,
      [`${experienceId}-${bulletId}`]: false,
    }));
    setConfirmationModal(null);
  };

  const handleRefinement = async (refinementInstructions: string) => {
    if (!confirmationModal) return;

    const { experienceId, bulletId, originalText } = confirmationModal;
    const experience = experiences.find((exp) => exp.id === experienceId);
    if (!experience) return;

    setIsRefining(true);

    try {
      // Get other bullet points for context (same as before)
      const otherBulletPoints = experience.bulletPoints
        .filter((bp) => bp.id !== bulletId && bp.text.trim())
        .map((bp) => bp.text);

      // Create enhanced AI settings with refinement instructions
      const refinedAISettings = {
        ...aiSettings,
        userInstructions:
          `${aiSettings?.userInstructions || ""}\n\nREFINEMENT REQUEST: ${refinementInstructions}`.trim(),
      };

      const refinedAIService = createAIService(refinedAISettings);

      const enhancedText = await refinedAIService.summarizeAndEnhance(
        originalText,
        {
          company: experience.company,
          position: experience.position,
        },
        "concise",
        otherBulletPoints,
      );

      // Update the modal with the refined text
      setConfirmationModal((prev) =>
        prev
          ? {
              ...prev,
              enhancedText,
            }
          : null,
      );
    } catch (error) {
      console.error("Error refining bullet point:", error);
      alert(
        error instanceof Error ? error.message : "Failed to refine achievement",
      );
    } finally {
      setIsRefining(false);
    }
  };

  const handleExperienceDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = experiences.findIndex((exp) => exp.id === active.id);
    const newIndex = experiences.findIndex((exp) => exp.id === over.id);
    onChange(arrayMove(experiences, oldIndex, newIndex));
  };

  const handleBulletPointDragEnd =
    (experienceId: string) => (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const experience = experiences.find((exp) => exp.id === experienceId);
      if (!experience) return;

      const bulletPoints = experience.bulletPoints;
      const oldIndex = bulletPoints.findIndex((bp) => bp.id === active.id);
      const newIndex = bulletPoints.findIndex((bp) => bp.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newBulletPoints = arrayMove(bulletPoints, oldIndex, newIndex);

        onChange(
          experiences.map((exp) =>
            exp.id === experienceId
              ? { ...exp, bulletPoints: newBulletPoints }
              : exp,
          ),
        );
      }
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Work Experience
        </CardTitle>
        <CardDescription>
          List your professional experience, including company, position, and
          key achievements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleExperienceDragEnd}
        >
          <SortableContext
            items={experiences.map((exp) => exp.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {experiences.map((exp) => (
                <SortableItem key={exp.id} id={exp.id}>
                  <div className="space-y-3 p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <TextInput
                          label="Company"
                          placeholder="Company name"
                          value={exp.company}
                          onChange={(e) =>
                            updateExperience(exp.id, "company", e.target.value)
                          }
                        />
                        <TextInput
                          label="Position"
                          placeholder="Job title"
                          value={exp.position}
                          onChange={(e) =>
                            updateExperience(exp.id, "position", e.target.value)
                          }
                        />
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <TextInput
                            label="Start Date"
                            placeholder="MM/YYYY"
                            value={exp.startDate}
                            onChange={(e) =>
                              updateExperience(
                                exp.id,
                                "startDate",
                                e.target.value,
                              )
                            }
                          />
                          <TextInput
                            label="End Date"
                            placeholder="MM/YYYY or 'Present'"
                            value={exp.isCurrent ? "Present" : exp.endDate}
                            onChange={(e) =>
                              updateExperience(
                                exp.id,
                                "endDate",
                                e.target.value,
                              )
                            }
                            disabled={exp.isCurrent}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`current-${exp.id}`}
                            checked={exp.isCurrent}
                            onChange={(e) =>
                              updateExperience(
                                exp.id,
                                "isCurrent",
                                e.target.checked,
                              )
                            }
                            className="h-4 w-4 rounded border-input bg-background"
                          />
                          <label
                            htmlFor={`current-${exp.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            I currently work here
                          </label>
                        </div>
                        <TextInput
                          label="Location"
                          placeholder="City, State or Remote"
                          value={exp.location}
                          onChange={(e) =>
                            updateExperience(exp.id, "location", e.target.value)
                          }
                        />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText
                                size={16}
                                className="text-muted-foreground"
                              />
                              <h4 className="text-sm font-medium text-muted-foreground">
                                Job Description (for AI tailoring)
                              </h4>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setShowJobDescription((prev) => ({
                                  ...prev,
                                  [exp.id]: !prev[exp.id],
                                }))
                              }
                              className="text-xs"
                            >
                              {showJobDescription[exp.id] ? "Hide" : "Show"}
                            </Button>
                          </div>
                          {showJobDescription[exp.id] && (
                            <div className="space-y-1">
                              <TextareaAutosize
                                placeholder="Paste the job description here to help AI tailor your achievements..."
                                value={exp.jobDescription || ""}
                                onChange={(e) =>
                                  updateExperience(
                                    exp.id,
                                    "jobDescription",
                                    e.target.value,
                                  )
                                }
                                minRows={3}
                                className="w-full resize-none rounded-lg border border-input bg-background/60 px-3 py-2 text-sm backdrop-blur-sm transition-all placeholder:text-muted-foreground hover:border-ring/30 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <IconButton
                        variant="ghost"
                        aria-label="Remove experience"
                        icon={<X size={16} />}
                        onClick={() => removeExperience(exp.id)}
                        className="ml-2 mt-2 text-muted-foreground hover:text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium text-muted-foreground">
                          Key Achievements
                        </h4>
                        {onNavigateToAISettings && (
                          <div className="flex items-center gap-1">
                            {!aiSettings?.hasApiKey && (
                              <span className="text-xs font-medium text-amber-600">
                                Configure AI →
                              </span>
                            )}
                            <IconButton
                              variant="ghost"
                              aria-label="AI Settings"
                              icon={<Settings size={14} />}
                              onClick={onNavigateToAISettings}
                              className={` ${
                                aiSettings?.hasApiKey
                                  ? "text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                                  : "text-amber-500 hover:bg-amber-50 hover:text-amber-600"
                              } `}
                              title="Go to AI Settings"
                            />
                          </div>
                        )}
                      </div>
                      {!aiSettings?.hasApiKey && onNavigateToAISettings && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/50">
                          <div className="flex items-center gap-2">
                            <Sparkles
                              size={16}
                              className="flex-shrink-0 text-amber-600"
                            />
                            <div className="text-xs">
                              <p className="mb-1 font-medium text-amber-800 dark:text-amber-200">
                                AI Enhancement Available
                              </p>
                              <p className="mb-2 text-amber-700 dark:text-amber-300">
                                Configure your AI settings to enhance,
                                summarize, and tailor your achievements
                                automatically.
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onNavigateToAISettings}
                                className="border-amber-300 bg-amber-100 text-xs text-amber-700 hover:bg-amber-200"
                              >
                                <Settings size={12} className="mr-1" />
                                Set up AI
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleBulletPointDragEnd(exp.id)}
                      >
                        <SortableContext
                          items={exp.bulletPoints.map((bullet) => bullet.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-1.5">
                            {exp.bulletPoints.map((bullet) => (
                              <SortableItem
                                key={bullet.id}
                                id={bullet.id}
                                className="w-full rounded-lg bg-background/20 hover:border-primary"
                                contentClassName="w-full pl-10 pr-2 py-2"
                                alwaysShowDragHandle={true}
                              >
                                <div className="flex w-full items-start gap-2">
                                  <TextareaAutosize
                                    placeholder="Describe your achievement or responsibility"
                                    value={bullet.text || ""}
                                    onChange={(e) =>
                                      updateBulletPoint(
                                        exp.id,
                                        bullet.id,
                                        e.target.value,
                                      )
                                    }
                                    minRows={2}
                                    className="flex-1 resize-none rounded-lg border border-input bg-background/60 px-3 py-2 text-sm backdrop-blur-sm transition-all placeholder:text-muted-foreground hover:border-ring/30 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                  />
                                  <div className="flex flex-shrink-0 flex-col items-center justify-start gap-1 pt-2">
                                    {aiSettings?.hasApiKey && (
                                      <IconButton
                                        variant="ghost"
                                        aria-label="Enhance with AI (concise)"
                                        icon={
                                          loadingStates[
                                            `${exp.id}-${bullet.id}`
                                          ] ? (
                                            <Loader2
                                              size={14}
                                              className="animate-spin"
                                            />
                                          ) : (
                                            <Sparkles size={14} />
                                          )
                                        }
                                        onClick={() =>
                                          enhanceBulletPoint(exp.id, bullet.id)
                                        }
                                        disabled={
                                          loadingStates[
                                            `${exp.id}-${bullet.id}`
                                          ]
                                        }
                                        className="h-8 w-8"
                                      />
                                    )}
                                    <IconButton
                                      variant="ghost"
                                      aria-label="Remove bullet point"
                                      title="Remove bullet point"
                                      icon={<X size={14} />}
                                      onClick={() =>
                                        removeBulletPoint(exp.id, bullet.id)
                                      }
                                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                    />
                                  </div>
                                </div>
                              </SortableItem>
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addBulletPoint(exp.id)}
                      >
                        <Plus size={14} className="mr-1" /> Add Achievement
                      </Button>
                    </div>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <Button
          type="button"
          variant="outline"
          onClick={addExperience}
          className="mt-3 w-full"
        >
          <Plus size={16} className="mr-2" /> Add Experience
        </Button>
      </CardContent>
      {/* AI Enhancement Confirmation Modal */}
      {confirmationModal && (
        <AIConfirmationModal
          isOpen={confirmationModal.isOpen}
          originalText={confirmationModal.originalText}
          enhancedText={confirmationModal.enhancedText}
          onAccept={handleAcceptEnhancement}
          onReject={handleRejectEnhancement}
          onRefine={handleRefinement}
          isRefining={isRefining}
        />
      )}
    </Card>
  );
}
