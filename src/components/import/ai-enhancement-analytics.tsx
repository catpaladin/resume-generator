import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

interface EnhancementHistory {
  id: string;
  timestamp: Date;
  provider: string;
  model: string;
  suggestionsCount: number;
  acceptedCount: number;
  rejectedCount: number;
  confidence: number;
  processingTime: number;
  estimatedCost: number;
  enhancementLevel: string;
  jobDescription?: string;
}

interface AIAnalyticsProps {
  className?: string;
}

// Mock data for demonstration - in production, this would come from a proper analytics store
const mockHistory: EnhancementHistory[] = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 86400000),
    provider: "OpenAI",
    model: "gpt-4o-mini",
    suggestionsCount: 12,
    acceptedCount: 9,
    rejectedCount: 3,
    confidence: 0.87,
    processingTime: 8500,
    estimatedCost: 0.045,
    enhancementLevel: "moderate",
    jobDescription: "Software Engineer at Tech Corp",
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 172800000),
    provider: "Claude",
    model: "claude-3-5-sonnet",
    suggestionsCount: 8,
    acceptedCount: 7,
    rejectedCount: 1,
    confidence: 0.92,
    processingTime: 12300,
    estimatedCost: 0.089,
    enhancementLevel: "comprehensive",
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 259200000),
    provider: "Gemini",
    model: "gemini-1.5-pro",
    suggestionsCount: 15,
    acceptedCount: 11,
    rejectedCount: 4,
    confidence: 0.78,
    processingTime: 6200,
    estimatedCost: 0.032,
    enhancementLevel: "light",
  },
];

export function AIEnhancementAnalytics({ className = "" }: AIAnalyticsProps) {
  const [history] = useState<EnhancementHistory[]>(mockHistory);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  // Calculate analytics
  const totalEnhancements = history.length;
  const totalSuggestions = history.reduce(
    (sum, h) => sum + h.suggestionsCount,
    0,
  );
  const totalAccepted = history.reduce((sum, h) => sum + h.acceptedCount, 0);
  const totalCost = history.reduce((sum, h) => sum + h.estimatedCost, 0);
  const avgConfidence =
    history.reduce((sum, h) => sum + h.confidence, 0) / history.length;
  const avgProcessingTime =
    history.reduce((sum, h) => sum + h.processingTime, 0) / history.length;
  const acceptanceRate = totalAccepted / totalSuggestions;

  // Provider usage stats
  const providerStats = history.reduce(
    (stats, h) => {
      stats[h.provider] = (stats[h.provider] || 0) + 1;
      return stats;
    },
    {} as Record<string, number>,
  );

  // Enhancement level stats
  // const levelStats = history.reduce((stats, h) => {
  //   stats[h.enhancementLevel] = (stats[h.enhancementLevel] || 0) + 1;
  //   return stats;
  // }, {} as Record<string, number>);

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color = "blue",
    trend,
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ElementType;
    color?: "blue" | "green" | "purple" | "amber" | "red";
    trend?: "up" | "down" | "neutral";
  }) => {
    const colorClasses = {
      blue: "text-blue-600 bg-blue-50",
      green: "text-green-600 bg-green-50",
      purple: "text-purple-600 bg-purple-50",
      amber: "text-amber-600 bg-amber-50",
      red: "text-red-600 bg-red-50",
    };

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
            <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
              <Icon size={24} />
            </div>
          </div>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp
                size={12}
                className={
                  trend === "up"
                    ? "text-green-500"
                    : trend === "down"
                      ? "text-red-500"
                      : "text-gray-500"
                }
              />
              <span
                className={`text-xs ${
                  trend === "up"
                    ? "text-green-600"
                    : trend === "down"
                      ? "text-red-600"
                      : "text-gray-600"
                }`}
              >
                {trend === "up"
                  ? "↗ Trending up"
                  : trend === "down"
                    ? "↘ Trending down"
                    : "→ Stable"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            AI Enhancement Analytics
          </h2>
          <p className="text-gray-600">
            Track your AI usage, performance, and optimization trends
          </p>
        </div>
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as typeof timeRange)}
              className={`rounded-md px-3 py-1 text-sm ${
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Enhancements"
          value={totalEnhancements}
          subtitle="Sessions completed"
          icon={Sparkles}
          color="blue"
          trend="up"
        />
        <StatCard
          title="Acceptance Rate"
          value={`${Math.round(acceptanceRate * 100)}%`}
          subtitle="Suggestions accepted"
          icon={CheckCircle}
          color="green"
          trend="up"
        />
        <StatCard
          title="Avg Confidence"
          value={`${Math.round(avgConfidence * 100)}%`}
          subtitle="AI confidence score"
          icon={Target}
          color="purple"
          trend="neutral"
        />
        <StatCard
          title="Total Cost"
          value={`$${totalCost.toFixed(3)}`}
          subtitle="API usage cost"
          icon={DollarSign}
          color="amber"
          trend="down"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="text-amber-500" size={20} />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Average Processing Time
                </span>
                <span className="text-sm text-gray-600">
                  {(avgProcessingTime / 1000).toFixed(1)}s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Total Suggestions Generated
                </span>
                <span className="text-sm text-gray-600">
                  {totalSuggestions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Success Rate</span>
                <span className="text-sm text-green-600">100%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Error Rate</span>
                <span className="text-sm text-gray-600">0%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="text-blue-500" size={20} />
              Provider Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(providerStats).map(([provider, count]) => {
                const percentage = (count / totalEnhancements) * 100;
                return (
                  <div key={provider}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">{provider}</span>
                      <span className="text-sm text-gray-600">
                        {count} ({Math.round(percentage)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhancement History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="text-green-500" size={20} />
            Recent Enhancement History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Provider</th>
                  <th className="p-2 text-left">Level</th>
                  <th className="p-2 text-left">Suggestions</th>
                  <th className="p-2 text-left">Accepted</th>
                  <th className="p-2 text-left">Confidence</th>
                  <th className="p-2 text-left">Time</th>
                  <th className="p-2 text-left">Cost</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      {item.timestamp.toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <span>{item.provider}</span>
                        <span className="text-xs text-gray-500">
                          {item.model}
                        </span>
                      </div>
                    </td>
                    <td className="p-2">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                        {item.enhancementLevel}
                      </span>
                    </td>
                    <td className="p-2">{item.suggestionsCount}</td>
                    <td className="p-2">
                      <span className="text-green-600">
                        {item.acceptedCount}
                      </span>
                      <span className="text-gray-400">
                        /{item.suggestionsCount}
                      </span>
                    </td>
                    <td className="p-2">
                      <span
                        className={
                          item.confidence >= 0.8
                            ? "text-green-600"
                            : item.confidence >= 0.6
                              ? "text-amber-600"
                              : "text-red-600"
                        }
                      >
                        &quot;Moderate&quot;{Math.round(item.confidence * 100)}%
                      </span>
                    </td>
                    <td className="p-2">
                      {(item.processingTime / 1000).toFixed(1)}s
                    </td>
                    <td className="p-2">${item.estimatedCost.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-purple-500" size={20} />
            Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3">
              <CheckCircle className="mt-0.5 text-green-600" size={16} />
              <div>
                <p className="text-sm font-medium text-green-800">
                  &quot;Light&quot; Acceptance Rate
                </p>
                <p className="text-sm text-green-700">
                  Your {Math.round(acceptanceRate * 100)}% acceptance rate
                  indicates the AI suggestions are well-aligned with your
                  preferences.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
              <Sparkles className="mt-0.5 text-blue-600" size={16} />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  &quot;Moderate&quot; Enhancement Level
                </p>
                <p className="text-sm text-blue-700">
                  Consider using &quot;moderate&quot; enhancement level for the
                  best balance of suggestions and quality.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3">
              <DollarSign className="mt-0.5 text-amber-600" size={16} />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Cost Optimization
                </p>
                <p className="text-sm text-amber-700">
                  Switching to Gemini for basic enhancements could reduce costs
                  by ~30% while maintaining quality.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
