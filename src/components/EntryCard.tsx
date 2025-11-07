import { Entry } from "@/types/database.types";

interface EntryCardProps {
  entry: Entry;
  onDelete: (entryId: string) => void;
}

export default function EntryCard({ entry, onDelete }: EntryCardProps) {
  const formattedDate = new Date(entry.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      onDelete(entry.id);
    }
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
        <button
          className="cursor-pointer bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md ml-4"
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
        {entry.content}
      </p>
    </div>
  );
}