import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SortableItemProps {
  id: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  alwaysShowDragHandle?: boolean;
}

export function SortableItem({ id, children, className, contentClassName, alwaysShowDragHandle = false }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border bg-card transition-colors",
        isDragging && "z-50 opacity-50",
        className,
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className={`absolute left-2 top-1/2 -translate-y-1/2 cursor-grab p-1 ${alwaysShowDragHandle ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        style={{ touchAction: 'none', cursor: 'grab' }}
      >
        <GripVertical size={16} className="text-muted-foreground" />
      </div>
      <div className={contentClassName || "pl-8"}>{children}</div>
    </div>
  );
}
