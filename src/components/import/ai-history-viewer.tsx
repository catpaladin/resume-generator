import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Filter,
  Download,
  XCircle,
  AlertCircle,
  Search,
  FileText,
  Star,
  DollarSign,
  Users,
  Tag,
  Eye,
  Trash2,
  X,
  History,
} from "lucide-react";
import {
  enhancementHistory,
  type EnhancementHistoryEntry,
  type HistoryFilters,
  type HistoryStats,
} from "@/lib/ai/enhancement-history";

interface AIHistoryViewerProps {
  className?: string;
}

export function AIHistoryViewer({ className = "" }: AIHistoryViewerProps) {
  const [entries, setEntries] = useState<EnhancementHistoryEntry[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [filters, setFilters] = useState<HistoryFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEntry, setSelectedEntry] =
    useState<EnhancementHistoryEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "confidence" | "cost">("date");

  useEffect(() => {
    loadData();
  }, [filters, searchTerm, sortBy]);

  const loadData = () => {
    let filteredEntries = enhancementHistory.getHistory(filters);

    // Apply search filter
    if (searchTerm) {
      filteredEntries = filteredEntries.filter(
        (entry) =>
          entry.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase()),
          ) ||
          entry.settings.provider
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Apply sorting
    filteredEntries.sort((a, b) => {
      switch (sortBy) {
        case "confidence":
          return b.metadata.confidence - a.metadata.confidence;
        case "cost":
          return b.metadata.costEstimate - a.metadata.costEstimate;
        case "date":
        default:
          return b.timestamp.getTime() - a.timestamp.getTime();
      }
    });

    setEntries(filteredEntries);
    setStats(enhancementHistory.getStats(filters));
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm("Are you sure you want to delete this enhancement record?")) {
      enhancementHistory.deleteEnhancement(id);
      loadData();
    }
  };

  const handleExport = (format: "json" | "csv") => {
    const data = enhancementHistory.exportHistory(format);
    const blob = new Blob([data], {
      type: format === "json" ? "application/json" : "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `enhancement-history.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    enhancementHistory.updateMetadata(id, { notes });
    loadData();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getAcceptanceRate = (entry: EnhancementHistoryEntry) => {
    const total = entry.aiResult.suggestions.length;
    const accepted = entry.userActions.acceptedSuggestions.length;
    return total > 0 ? (accepted / total) * 100 : 0;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-amber-600";
    return "text-red-600";
  };

  if (!stats) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <History className="mx-auto mb-2 text-gray-400" size={48} />
          <p className="text-gray-600">Loading enhancement history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Enhancement History
          </h2>
          <p className="text-gray-600">
            View and manage your AI enhancement records
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1"
          >
            <Filter size={14} />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("json")}
            className="flex items-center gap-1"
          >
            <Download size={14} />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Enhancements
                </p>
                <p className="text-2xl font-bold">{stats.totalEnhancements}</p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3">
                <FileText className="text-blue-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Confidence
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(stats.averageConfidence * 100)}%
                </p>
              </div>
              <div className="rounded-lg bg-green-100 p-3">
                <Star className="text-green-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold">
                  ${stats.totalCost.toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg bg-amber-100 p-3">
                <DollarSign className="text-amber-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Top Provider
                </p>
                <p className="text-2xl font-bold">{stats.mostUsedProvider}</p>
              </div>
              <div className="rounded-lg bg-purple-100 p-3">
                <Users className="text-purple-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="text-blue-600" size={20} />
              Filter History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Provider
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  onChange={(e) => {
                    const provider = e.target.value;
                    setFilters({
                      ...filters,
                      providers: provider ? [provider] : undefined,
                    });
                  }}
                >
                  <option value="">All Providers</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Claude</option>
                  <option value="gemini">Gemini</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Enhancement Level
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  onChange={(e) => {
                    const level = e.target.value;
                    setFilters({
                      ...filters,
                      enhancementLevels: level ? [level] : undefined,
                    });
                  }}
                >
                  <option value="">All Levels</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="comprehensive">Comprehensive</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Min Confidence
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  onChange={(e) => {
                    const confidence = e.target.value;
                    setFilters({
                      ...filters,
                      minConfidence: confidence
                        ? parseFloat(confidence)
                        : undefined,
                    });
                  }}
                >
                  <option value="">Any Confidence</option>
                  <option value="0.8">80%+</option>
                  <option value="0.6">60%+</option>
                  <option value="0.4">40%+</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({});
                  setSearchTerm("");
                }}
              >
                Clear Filters
              </Button>
              <Button size="sm" onClick={() => setShowFilters(false)}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Sort */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by notes, tags, or provider..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm"
          />
        </div>
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-md border border-gray-300 p-2 text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="confidence">Sort by Confidence</option>
            <option value="cost">Sort by Cost</option>
          </select>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <History className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No Enhancement History
              </h3>
              <p className="text-gray-600">
                Your AI enhancement history will appear here after you process
                resumes.
              </p>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">
                        {formatDate(entry.timestamp)}
                      </h3>
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                        {entry.settings.provider}
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-800">
                        {entry.settings.enhancementLevel || "moderate"}
                      </span>
                    </div>

                    <div className="mb-3 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <span className="text-gray-500">Confidence:</span>
                        <span
                          className={`ml-1 font-medium ${getConfidenceColor(entry.metadata.confidence)}`}
                        >
                          {Math.round(entry.metadata.confidence * 100)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Suggestions:</span>
                        <span className="ml-1 font-medium">
                          {entry.aiResult.suggestions.length}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Accepted:</span>
                        <span className="ml-1 font-medium text-green-600">
                          {Math.round(getAcceptanceRate(entry))}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Cost:</span>
                        <span className="ml-1 font-medium">
                          ${entry.metadata.costEstimate.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    {entry.tags.length > 0 && (
                      <div className="mb-2 flex items-center gap-1">
                        <Tag size={14} className="text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {entry.tags.slice(0, 5).map((tag, index) => (
                            <span
                              key={index}
                              className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700"
                            >
                              {tag}
                            </span>
                          ))}
                          {entry.tags.length > 5 && (
                            <span className="text-xs text-gray-500">
                              +{entry.tags.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {entry.notes && (
                      <p className="text-sm italic text-gray-600">
                        {entry.notes}
                      </p>
                    )}
                  </div>

                  <div className="ml-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEntry(entry)}
                      className="flex items-center gap-1"
                    >
                      <Eye size={14} />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="text-blue-600" size={20} />
                  Enhancement Details
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEntry(null)}
                >
                  <X size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-medium">Enhancement Info</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <span className="ml-2">
                        {formatDate(selectedEntry.timestamp)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Provider:</span>
                      <span className="ml-2">
                        {selectedEntry.settings.provider}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Level:</span>
                      <span className="ml-2">
                        {selectedEntry.settings.enhancementLevel || "moderate"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Processing Time:</span>
                      <span className="ml-2">
                        {(selectedEntry.metadata.processingTime / 1000).toFixed(
                          1,
                        )}
                        s
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Results</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Confidence:</span>
                      <span
                        className={`ml-2 ${getConfidenceColor(selectedEntry.metadata.confidence)}`}
                      >
                        {Math.round(selectedEntry.metadata.confidence * 100)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Suggestions:</span>
                      <span className="ml-2">
                        {selectedEntry.aiResult.suggestions.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Accepted:</span>
                      <span className="ml-2 text-green-600">
                        {selectedEntry.userActions.acceptedSuggestions.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Cost:</span>
                      <span className="ml-2">
                        ${selectedEntry.metadata.costEstimate.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {selectedEntry.tags.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <h4 className="mb-2 font-medium">Notes</h4>
                <textarea
                  value={selectedEntry.notes}
                  onChange={(e) =>
                    handleUpdateNotes(selectedEntry.id, e.target.value)
                  }
                  placeholder="Add your notes about this enhancement..."
                  className="w-full resize-none rounded-md border border-gray-300 p-3 text-sm"
                  rows={3}
                />
              </div>

              {/* Settings Used */}
              {selectedEntry.settings.jobDescription && (
                <div>
                  <h4 className="mb-2 font-medium">Job Description Used</h4>
                  <div className="rounded-md bg-gray-50 p-3 text-sm">
                    {selectedEntry.settings.jobDescription}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
