"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import EntryCard from "@/components/EntryCard";
import { getEntries, deleteEntry } from "@/lib/supabase/queries";
import { getCurrentUser } from "@/lib/supabase/auth";
import { Entry } from "@/types/database.types";
import Link from "next/link";
import DiaryAI from "@/components/DiaryAI";

type SortOption = "newest" | "oldest" | "title";
type FilterOption = "all" | "recent" | "lastWeek";

export default function DashboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getCurrentUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const data = await getEntries();
        setEntries(data);
        setFilteredEntries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load entries");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  // Apply sorting and filtering when options change
  useEffect(() => {
    let result = [...entries];

    // Apply filters
    switch (filterBy) {
      case "recent":
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        result = result.filter(entry => new Date(entry.created_at) > oneDayAgo);
        break;
      case "lastWeek":
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        result = result.filter(entry => new Date(entry.created_at) > oneWeekAgo);
        break;
      case "all":
      default:
        // No filter applied
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredEntries(result);
  }, [entries, sortBy, filterBy]);

  const handleDeleteEntry = async (entryId: string) => {
    try {
      setError(null);
      await deleteEntry(entryId);

      // Remove the deleted entry from the local state
      setEntries((prevEntries) =>
        prevEntries.filter((entry) => entry.id !== entryId)
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete entry";
      setError(`Delete failed: ${errorMessage}`);
      alert(`Failed to delete entry: ${errorMessage}`);
    }
  };

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case "newest": return "Newest First";
      case "oldest": return "Oldest First";
      case "title": return "Title A-Z";
      default: return "Newest First";
    }
  };

  const getFilterLabel = (option: FilterOption) => {
    switch (option) {
      case "all": return "All Entries";
      case "recent": return "Last 24 Hours";
      case "lastWeek": return "Last Week";
      default: return "All Entries";
    }
  };

  // Calculate stats based on filtered entries
  const totalEntries = filteredEntries.length;
  const totalWords = filteredEntries.reduce((total, entry) => total + (entry.content?.length || 0), 0);
  const lastEntryDate = filteredEntries.length > 0 
    ? new Date(Math.max(...filteredEntries.map(e => new Date(e.created_at).getTime()))).toLocaleDateString() 
    : '--';

  const handleEditEntry = (entryId: string) => {
    router.push(`/edit-entry?id=${entryId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your entries...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-2">
              Your Journal
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {filteredEntries.length} {filteredEntries.length === 1 ? "entry" : "entries"} • Last updated today
            </p>
          </div>
          
          <Link href="/new-entry">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Entry
            </button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalEntries}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Entries</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalWords.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Characters Written</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {lastEntryDate}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Last Entry</div>
          </div>
        </div>

        {/* Entries List */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {entries.length === 0 ? "No entries yet" : "No entries match your filter"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              {entries.length === 0 
                ? "Start your journaling journey by writing your first entry. Capture your thoughts, ideas, and memories."
                : "Try changing your filter settings to see more entries."
              }
            </p>
            <Link href="/new-entry">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200">
                {entries.length === 0 ? "Write Your First Entry" : "Create New Entry"}
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sort and Filter Options */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing: <span className="font-medium text-gray-700 dark:text-gray-300">{getFilterLabel(filterBy)}</span>
              </div>
              <div className="flex gap-2">
                {/* Filter Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setShowFilterOptions(!showFilterOptions)}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1"
                  >
                    Filter
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showFilterOptions && (
                    <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                      {(["all", "recent", "lastWeek"] as FilterOption[]).map(option => (
                        <button
                          key={option}
                          onClick={() => {
                            setFilterBy(option);
                            setShowFilterOptions(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            filterBy === option 
                              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          } first:rounded-t-lg last:rounded-b-lg`}
                        >
                          {getFilterLabel(option)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setShowSortOptions(!showSortOptions)}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1"
                  >
                    Sort
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showSortOptions && (
                    <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                      {(["newest", "oldest", "title"] as SortOption[]).map(option => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option);
                            setShowSortOptions(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            sortBy === option 
                              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          } first:rounded-t-lg last:rounded-b-lg`}
                        >
                          {getSortLabel(option)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Entries Grid */}
            <div className="space-y-6">
              {filteredEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={handleDeleteEntry}
                  onEdit={handleEditEntry}
                />
              ))}
            </div>
            <DiaryAI />
          </div>
        )}
      </main>
    </div>
  );
}