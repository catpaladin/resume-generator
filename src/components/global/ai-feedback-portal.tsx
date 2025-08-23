"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AIFeedbackSystem } from "@/components/import/ai-feedback-system";

export function AIFeedbackPortal() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const portalElement = document.getElementById("ai-feedback-portal");
  if (!portalElement) return null;

  return createPortal(<AIFeedbackSystem className="max-w-md" />, portalElement);
}
