import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  Star,
} from "lucide-react";

type NotificationType = "success" | "error" | "warning" | "info" | "loading";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  }>;
  progress?: number;
  timestamp: Date;
}

interface FeedbackData {
  rating: number;
  helpful: boolean | null;
  comment: string;
  category: "accuracy" | "speed" | "usability" | "suggestions" | "other";
}

interface AIFeedbackSystemProps {
  className?: string;
}

export function AIFeedbackSystem({ className = "" }: AIFeedbackSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    rating: 0,
    helpful: null,
    comment: "",
    category: "suggestions",
  });

  // Auto-remove notifications after their duration
  useEffect(() => {
    const timers = notifications
      .filter((n) => n.duration && n.type !== "loading")
      .map((notification) =>
        setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration),
      );

    return () => timers.forEach(clearTimeout);
  }, [notifications]);

  const addNotification = useCallback(
    (
      type: NotificationType,
      title: string,
      message: string,
      options?: {
        duration?: number;
        actions?: Notification["actions"];
        progress?: number;
      },
    ) => {
      const notification: Notification = {
        id: `notification-${Date.now()}-${Math.random()}`,
        type,
        title,
        message,
        duration: options?.duration || (type === "loading" ? undefined : 5000),
        actions: options?.actions,
        progress: options?.progress,
        timestamp: new Date(),
      };

      setNotifications((prev) => [notification, ...prev.slice(0, 4)]); // Keep max 5 notifications
      return notification.id;
    },
    [],
  );

  const updateNotification = useCallback(
    (id: string, updates: Partial<Notification>) => {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, ...updates }
            : notification,
        ),
      );
    },
    [],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const submitFeedback = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      addNotification(
        "success",
        "Feedback Submitted",
        "Thank you for helping us improve AI enhancements!",
        { duration: 3000 },
      );

      setShowFeedbackForm(false);
      setFeedbackData({
        rating: 0,
        helpful: null,
        comment: "",
        category: "suggestions",
      });
    } catch {
      console.error("Failed to submit feedback");
      addNotification(
        "error",
        "Feedback Failed",
        "Unable to submit feedback. Please try again.",
        { duration: 4000 },
      );
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-green-500" size={20} />;
      case "error":
        return <AlertTriangle className="text-red-500" size={20} />;
      case "warning":
        return <AlertTriangle className="text-amber-500" size={20} />;
      case "info":
        return <Info className="text-blue-500" size={20} />;
      case "loading":
        return <Loader2 className="animate-spin text-blue-500" size={20} />;
      default:
        return <Info className="text-gray-500" size={20} />;
    }
  };

  const getNotificationStyles = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50 text-green-800";
      case "error":
        return "border-red-200 bg-red-50 text-red-800";
      case "warning":
        return "border-amber-200 bg-amber-50 text-amber-800";
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-800";
      case "loading":
        return "border-blue-200 bg-blue-50 text-blue-800";
      default:
        return "border-gray-200 bg-gray-50 text-gray-800";
    }
  };

  // Demo notifications for development
  const addDemoNotifications = useCallback(() => {
    addNotification(
      "loading",
      "Enhancing Resume",
      "AI is analyzing your resume and generating suggestions...",
      { progress: 45 },
    );

    setTimeout(() => {
      addNotification(
        "success",
        "Enhancement Complete",
        "Generated 12 suggestions with 89% confidence",
        {
          duration: 4000,
          actions: [
            {
              label: "Review",
              onClick: () => console.log("Review clicked"),
              variant: "primary",
            },
          ],
        },
      );
    }, 2000);

    setTimeout(() => {
      addNotification(
        "info",
        "Tip",
        "Consider using job descriptions for better targeting",
        { duration: 6000 },
      );
    }, 3000);
  }, [addNotification]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Notifications Container */}
      <div className="fixed right-4 top-4 z-50 max-w-md space-y-2">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`shadow-lg transition-all duration-300 ${getNotificationStyles(notification.type)}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">
                      {notification.title}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNotification(notification.id)}
                      className="h-6 w-6 p-0 hover:bg-white/50"
                    >
                      <X size={14} />
                    </Button>
                  </div>

                  <p className="mt-1 text-sm opacity-90">
                    {notification.message}
                  </p>

                  {notification.progress !== undefined && (
                    <div className="mt-2">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span>Progress</span>
                        <span>{notification.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/30">
                        <div
                          className="h-1.5 rounded-full bg-current transition-all duration-300"
                          style={{ width: `${notification.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {notification.actions && (
                    <div className="mt-3 flex gap-2">
                      {notification.actions.map((action, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant={
                            action.variant === "primary" ? "default" : "outline"
                          }
                          onClick={action.onClick}
                          className="h-7 text-xs"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 text-xs opacity-60">
                    {notification.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feedback Form */}
      {showFeedbackForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="text-blue-600" size={20} />
              How was your AI enhancement experience?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Rating */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Overall Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() =>
                      setFeedbackData({ ...feedbackData, rating: star })
                    }
                    className={`rounded p-1 ${
                      star <= feedbackData.rating
                        ? "text-yellow-500"
                        : "text-gray-300 hover:text-yellow-400"
                    }`}
                  >
                    <Star
                      size={20}
                      fill={
                        star <= feedbackData.rating ? "currentColor" : "none"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Helpful */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Were the suggestions helpful?
              </label>
              <div className="flex gap-2">
                <Button
                  variant={
                    feedbackData.helpful === true ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setFeedbackData({ ...feedbackData, helpful: true })
                  }
                  className="flex items-center gap-1"
                >
                  <ThumbsUp size={14} />
                  Yes
                </Button>
                <Button
                  variant={
                    feedbackData.helpful === false ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setFeedbackData({ ...feedbackData, helpful: false })
                  }
                  className="flex items-center gap-1"
                >
                  <ThumbsDown size={14} />
                  No
                </Button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Feedback Category
              </label>
              <select
                value={feedbackData.category}
                onChange={(e) =>
                  setFeedbackData({
                    ...feedbackData,
                    category: e.target.value as FeedbackData["category"],
                  })
                }
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
              >
                <option value="suggestions">Suggestion Quality</option>
                <option value="accuracy">AI Accuracy</option>
                <option value="speed">Processing Speed</option>
                <option value="usability">User Interface</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Comment */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Additional Comments
              </label>
              <textarea
                value={feedbackData.comment}
                onChange={(e) =>
                  setFeedbackData({ ...feedbackData, comment: e.target.value })
                }
                placeholder="Tell us about your experience or suggest improvements..."
                className="w-full resize-none rounded-md border border-gray-300 p-2 text-sm"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFeedbackForm(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={submitFeedback}
                disabled={feedbackData.rating === 0}
                className="flex items-center gap-1"
              >
                <Send size={14} />
                Submit Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
