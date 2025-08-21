import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Activity,
  Target,
  Settings,
  Download,
} from "lucide-react";
import {
  usageTracker,
  type UsageStats,
  type CostMonitoring,
} from "@/lib/ai/usage-tracker";

interface AIUsageMonitorProps {
  className?: string;
}

export function AIUsageMonitor({ className = "" }: AIUsageMonitorProps) {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [costMonitoring, setCostMonitoring] = useState<CostMonitoring | null>(
    null,
  );
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [showCostSettings, setShowCostSettings] = useState(false);
  const [costLimits, setCostLimits] = useState({
    dailyLimit: "",
    monthlyLimit: "",
    dailyAlert: "",
    monthlyAlert: "",
  });

  useEffect(() => {
    loadData();
  }, [timeRange]);

  useEffect(() => {
    // Listen for cost alerts
    const handleCostAlert = (event: CustomEvent) => {
      // You could show a notification here
      console.log("Cost alert received:", event.detail);
    };

    window.addEventListener("ai-cost-alert", handleCostAlert as EventListener);
    return () =>
      window.removeEventListener(
        "ai-cost-alert",
        handleCostAlert as EventListener,
      );
  }, []);

  const loadData = () => {
    const newStats = usageTracker.getStats(timeRange);
    const monitoring = usageTracker.getCostMonitoring();
    setStats(newStats);
    setCostMonitoring(monitoring);
  };

  const handleExportData = (format: "json" | "csv") => {
    const data = usageTracker.exportData(format);
    const blob = new Blob([data], {
      type: format === "json" ? "application/json" : "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-usage-data.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveCostSettings = () => {
    const settings: Partial<CostMonitoring> = {};

    if (costLimits.dailyLimit) {
      settings.dailyLimit = parseFloat(costLimits.dailyLimit);
    }
    if (costLimits.monthlyLimit) {
      settings.monthlyLimit = parseFloat(costLimits.monthlyLimit);
    }
    if (costLimits.dailyAlert || costLimits.monthlyAlert) {
      settings.alertThresholds = {};
      if (costLimits.dailyAlert) {
        settings.alertThresholds.daily = parseFloat(costLimits.dailyAlert);
      }
      if (costLimits.monthlyAlert) {
        settings.alertThresholds.monthly = parseFloat(costLimits.monthlyAlert);
      }
    }

    usageTracker.setCostMonitoring(settings);
    loadData();
    setShowCostSettings(false);
  };

  if (!stats || !costMonitoring) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Activity className="mx-auto mb-2 text-gray-400" size={48} />
          <p className="text-gray-600">Loading usage data...</p>
        </div>
      </div>
    );
  }

  const getCostStatus = (current: number, limit?: number) => {
    if (!limit) return "unknown";
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return "critical";
    if (percentage >= 75) return "warning";
    return "safe";
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(4)}`;
  const formatTime = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Usage Monitor</h2>
          <p className="text-gray-600">
            Track costs, performance, and usage patterns
          </p>
        </div>
        <div className="flex gap-2">
          {([7, 30, 90] as const).map((days) => (
            <Button
              key={days}
              variant={timeRange === days ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(days)}
            >
              {days}d
            </Button>
          ))}
        </div>
      </div>

      {/* Cost Monitoring Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className={`${
            getCostStatus(
              costMonitoring.currentSpending.today,
              costMonitoring.dailyLimit,
            ) === "critical"
              ? "border-red-500 bg-red-50"
              : getCostStatus(
                    costMonitoring.currentSpending.today,
                    costMonitoring.dailyLimit,
                  ) === "warning"
                ? "border-amber-500 bg-amber-50"
                : ""
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Today&apos;s Spending
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(costMonitoring.currentSpending.today)}
                </p>
                {costMonitoring.dailyLimit && (
                  <p className="text-xs text-gray-500">
                    Limit: {formatCurrency(costMonitoring.dailyLimit)}
                  </p>
                )}
              </div>
              <div className="rounded-lg bg-blue-100 p-3">
                <DollarSign className="text-blue-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${
            getCostStatus(
              costMonitoring.currentSpending.thisMonth,
              costMonitoring.monthlyLimit,
            ) === "critical"
              ? "border-red-500 bg-red-50"
              : getCostStatus(
                    costMonitoring.currentSpending.thisMonth,
                    costMonitoring.monthlyLimit,
                  ) === "warning"
                ? "border-amber-500 bg-amber-50"
                : ""
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(costMonitoring.currentSpending.thisMonth)}
                </p>
                {costMonitoring.monthlyLimit && (
                  <p className="text-xs text-gray-500">
                    Limit: {formatCurrency(costMonitoring.monthlyLimit)}
                  </p>
                )}
              </div>
              <div className="rounded-lg bg-green-100 p-3">
                <Calendar className="text-green-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Success Rate
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(stats.successRate * 100)}%
                </p>
                <p className="text-xs text-gray-500">
                  {stats.totalEvents} operations
                </p>
              </div>
              <div className="rounded-lg bg-green-100 p-3">
                <CheckCircle className="text-green-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Processing
                </p>
                <p className="text-2xl font-bold">
                  {formatTime(stats.avgProcessingTime)}
                </p>
                <p className="text-xs text-gray-500">per operation</p>
              </div>
              <div className="rounded-lg bg-amber-100 p-3">
                <Clock className="text-amber-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projected Spending Alert */}
      {costMonitoring.monthlyLimit &&
        costMonitoring.projectedSpending.monthly >
          costMonitoring.monthlyLimit && (
          <Card className="border-amber-500 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 text-amber-600" size={20} />
                <div>
                  <h3 className="font-medium text-amber-800">
                    Projected Overspending
                  </h3>
                  <p className="text-sm text-amber-700">
                    We&apos;ll notify you when you&apos;re approaching limits.
                    You are projected to spend{" "}
                    {formatCurrency(costMonitoring.projectedSpending.monthly)}{" "}
                    this month, You&apos;re approaching your daily limit. of{" "}
                    {formatCurrency(costMonitoring.monthlyLimit)}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="text-blue-500" size={20} />
              Provider Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.providerUsage).map(([provider, count]) => {
                const percentage = (count / stats.totalEvents) * 100;
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="text-purple-500" size={20} />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Operations</span>
                <span className="text-sm text-gray-600">
                  {stats.totalEvents}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Tokens</span>
                <span className="text-sm text-gray-600">
                  {stats.totalTokens.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Cost</span>
                <span className="text-sm text-gray-600">
                  {formatCurrency(stats.totalCost)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Confidence</span>
                <span className="text-sm text-gray-600">
                  {Math.round(stats.avgConfidence * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Settings Modal */}
      {showCostSettings && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="text-blue-600" size={20} />
              Cost Monitoring Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Daily Spending Limit
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 5.00"
                  value={costLimits.dailyLimit}
                  onChange={(e) =>
                    setCostLimits({ ...costLimits, dailyLimit: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Monthly Spending Limit
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 50.00"
                  value={costLimits.monthlyLimit}
                  onChange={(e) =>
                    setCostLimits({
                      ...costLimits,
                      monthlyLimit: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Daily Alert Threshold
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 3.00"
                  value={costLimits.dailyAlert}
                  onChange={(e) =>
                    setCostLimits({ ...costLimits, dailyAlert: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Monthly Alert Threshold
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 30.00"
                  value={costLimits.monthlyAlert}
                  onChange={(e) =>
                    setCostLimits({
                      ...costLimits,
                      monthlyAlert: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCostSettings(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveCostSettings}>
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportData("json")}
            className="flex items-center gap-1"
          >
            <Download size={14} />
            Export JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportData("csv")}
            className="flex items-center gap-1"
          >
            <Download size={14} />
            Export CSV
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCostSettings(true)}
          className="flex items-center gap-1"
        >
          <Settings size={14} />
          Cost Settings
        </Button>
      </div>
    </div>
  );
}
