import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { Button } from "@/components/ui/button/button";
import { IconButton } from "@/components/ui/button/icon-button";
import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { UserFeedback } from "@/lib/error-handling";

interface FeedbackContextType {
  showFeedback: (feedback: UserFeedback) => void;
  hideFeedback: (id: string) => void;
  clearAll: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within FeedbackProvider");
  }
  return context;
}

interface FeedbackItem extends UserFeedback {
  id: string;
  timestamp: number;
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

  const hideFeedback = useCallback((id: string) => {
    setFeedbacks((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const showFeedback = useCallback(
    (feedback: UserFeedback) => {
      const feedbackItem: FeedbackItem = {
        ...feedback,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };

      setFeedbacks((prev) => [...prev, feedbackItem]);

      if (feedback.autoClose) {
        setTimeout(() => {
          hideFeedback(feedbackItem.id);
        }, feedback.autoClose);
      }
    },
    [hideFeedback],
  );

  const clearAll = useCallback(() => {
    setFeedbacks([]);
  }, []);

  return (
    <FeedbackContext.Provider value={{ showFeedback, hideFeedback, clearAll }}>
      {children}
      <FeedbackContainer feedbacks={feedbacks} onHide={hideFeedback} />
    </FeedbackContext.Provider>
  );
}

function FeedbackContainer({
  feedbacks,
  onHide,
}: {
  feedbacks: FeedbackItem[];
  onHide: (id: string) => void;
}) {
  if (feedbacks.length === 0) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 max-w-md space-y-2">
      {feedbacks.map((feedback) => (
        <FeedbackCard
          key={feedback.id}
          feedback={feedback}
          onHide={() => onHide(feedback.id)}
        />
      ))}
    </div>
  );
}

function FeedbackCard({
  feedback,
  onHide,
}: {
  feedback: FeedbackItem;
  onHide: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const getIcon = () => {
    switch (feedback.type) {
      case "success":
        return <CheckCircle size={20} className="text-green-600" />;
      case "warning":
        return <AlertTriangle size={20} className="text-yellow-600" />;
      case "error":
        return <AlertCircle size={20} className="text-red-600" />;
      case "info":
      default:
        return <Info size={20} className="text-blue-600" />;
    }
  };

  const getCardStyles = () => {
    const baseStyles =
      "rounded-lg border shadow-lg p-4 transition-all duration-300 transform ";
    const visibilityStyles = isVisible
      ? "translate-x-0 opacity-100"
      : "translate-x-full opacity-0";

    switch (feedback.type) {
      case "success":
        return baseStyles + "border-green-200 bg-green-50 " + visibilityStyles;
      case "warning":
        return (
          baseStyles + "border-yellow-200 bg-yellow-50 " + visibilityStyles
        );
      case "error":
        return baseStyles + "border-red-200 bg-red-50 " + visibilityStyles;
      case "info":
      default:
        return baseStyles + "border-blue-200 bg-blue-50 " + visibilityStyles;
    }
  };

  const handleHide = () => {
    setIsVisible(false);
    setTimeout(onHide, 300);
  };

  const hasDetails = feedback.details && feedback.details.length > 0;
  const hasActions = feedback.actions && feedback.actions.length > 0;

  return (
    <div className={getCardStyles()}>
      <div className="flex items-start justify-between">
        <div className="flex flex-1 items-start space-x-3">
          {getIcon()}
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-gray-900">{feedback.title}</h4>
            <p className="mt-1 text-sm text-gray-700">{feedback.message}</p>
          </div>
        </div>

        <div className="ml-2 flex items-center space-x-1">
          {hasDetails && (
            <IconButton
              variant="ghost"
              size="sm"
              icon={
                isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
              }
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Collapse details" : "Expand details"}
            />
          )}

          {feedback.dismissible && (
            <IconButton
              variant="ghost"
              size="sm"
              icon={<X size={16} />}
              onClick={handleHide}
              aria-label="Dismiss"
            />
          )}
        </div>
      </div>

      {/* Expandable details */}
      {hasDetails && isExpanded && (
        <div className="mt-3 border-t border-gray-200 pt-3">
          <div className="space-y-1 text-sm text-gray-600">
            {feedback.details!.map((detail, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="mt-1 text-gray-400">•</span>
                <span>{detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {hasActions && (
        <div className="mt-3 border-t border-gray-200 pt-3">
          <div className="flex space-x-2">
            {feedback.actions!.map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant={action.primary ? "default" : "outline"}
                onClick={action.action}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function StandaloneFeedback({
  feedback,
  onDismiss,
  className = "",
}: {
  feedback: UserFeedback;
  onDismiss?: () => void;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = () => {
    switch (feedback.type) {
      case "success":
        return <CheckCircle size={20} className="text-green-600" />;
      case "warning":
        return <AlertTriangle size={20} className="text-yellow-600" />;
      case "error":
        return <AlertCircle size={20} className="text-red-600" />;
      case "info":
      default:
        return <Info size={20} className="text-blue-600" />;
    }
  };

  const getCardStyles = () => {
    const baseStyles = "rounded-lg border p-4 ";

    switch (feedback.type) {
      case "success":
        return baseStyles + "border-green-200 bg-green-50";
      case "warning":
        return baseStyles + "border-yellow-200 bg-yellow-50";
      case "error":
        return baseStyles + "border-red-200 bg-red-50";
      case "info":
      default:
        return baseStyles + "border-blue-200 bg-blue-50";
    }
  };

  const hasDetails = feedback.details && feedback.details.length > 0;
  const hasActions = feedback.actions && feedback.actions.length > 0;

  return (
    <div className={`${getCardStyles()} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-1 items-start space-x-3">
          {getIcon()}
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-gray-900">{feedback.title}</h4>
            <p className="mt-1 text-sm text-gray-700">{feedback.message}</p>
          </div>
        </div>

        <div className="ml-2 flex items-center space-x-1">
          {hasDetails && (
            <IconButton
              variant="ghost"
              size="sm"
              icon={
                isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
              }
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Collapse details" : "Expand details"}
            />
          )}

          {feedback.dismissible && onDismiss && (
            <IconButton
              variant="ghost"
              size="sm"
              icon={<X size={16} />}
              onClick={onDismiss}
              aria-label="Dismiss"
            />
          )}
        </div>
      </div>

      {/* Expandable details */}
      {hasDetails && isExpanded && (
        <div className="mt-3 border-t border-gray-200 pt-3">
          <div className="space-y-1 text-sm text-gray-600">
            {feedback.details!.map((detail, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="mt-1 text-gray-400">•</span>
                <span>{detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {hasActions && (
        <div className="mt-3 border-t border-gray-200 pt-3">
          <div className="flex space-x-2">
            {feedback.actions!.map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant={action.primary ? "default" : "outline"}
                onClick={action.action}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function useSuccessFeedback() {
  const { showFeedback } = useFeedback();

  return useCallback(
    (title: string, message: string, autoClose = 3000) => {
      showFeedback({
        type: "success",
        title,
        message,
        dismissible: true,
        autoClose,
      });
    },
    [showFeedback],
  );
}

export function useErrorFeedback() {
  const { showFeedback } = useFeedback();

  return useCallback(
    (
      title: string,
      message: string,
      details?: string[],
      actions?: UserFeedback["actions"],
    ) => {
      showFeedback({
        type: "error",
        title,
        message,
        details,
        actions,
        dismissible: true,
      });
    },
    [showFeedback],
  );
}

export function useWarningFeedback() {
  const { showFeedback } = useFeedback();

  return useCallback(
    (
      title: string,
      message: string,
      details?: string[],
      actions?: UserFeedback["actions"],
    ) => {
      showFeedback({
        type: "warning",
        title,
        message,
        details,
        actions,
        dismissible: true,
      });
    },
    [showFeedback],
  );
}

export function useInfoFeedback() {
  const { showFeedback } = useFeedback();

  return useCallback(
    (title: string, message: string, autoClose?: number) => {
      showFeedback({
        type: "info",
        title,
        message,
        dismissible: true,
        autoClose,
      });
    },
    [showFeedback],
  );
}
