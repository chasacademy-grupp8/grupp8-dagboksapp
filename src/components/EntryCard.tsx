import { Entry } from "@/types/database.types";

interface EntryCardProps {
  entry: Entry;
  onDelete: (entryId: string, entryTitle: string) => void;
  onEdit?: (entryId: string) => void;
}

export default function EntryCard({ entry, onDelete, onEdit }: EntryCardProps) {
  const formattedDate = new Date(entry.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDelete = () => {
    onDelete(entry.id, entry.title);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md dark:hover:shadow-gray-800/50 transition-all duration-300">
      <div className="mb-4 flex justify-between items-start">
        <div className="flex-1">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 tracking-wide uppercase font-medium">
            {formattedDate}
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            {entry.title}
          </h2>
        </div>

        <div className="flex gap-2">
          {onEdit && (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 text-sm"
              onClick={() => onEdit(entry.id)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
          
          <button
            className="cursor-pointer bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
        {entry.content}
      </p>
      {entry.tags && entry.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {entry.tags.map((t) => (
            <span
              key={t.id}
              className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full"
            >
              #{t.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
