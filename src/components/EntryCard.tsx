import { Entry } from "@/types/database.types";

interface EntryCardProps {
  entry: Entry;
  onDelete: (entryId: string) => void;
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
    if (window.confirm("Are you sure you want to delete this entry?")) {
      onDelete(entry.id);
    }
  };

  return (
    <div className="card" style={{ minWidth: "600px" }}>
      <div className="mb-4 flex justify-between">
        <div>
          <div className="text-xs text-warm-gray mb-2 tracking-wide uppercase">
            {formattedDate}
          </div>
          <h2 className="text-2xl font-serif text-dark-brown mb-3">
            {entry.title}
          </h2>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              className="cursor-pointer bg-blue-800 text-white px-3 py-1 rounded m-4 hover:bg-blue-600 transition-colors"
              onClick={() => onEdit(entry.id)}
            >
              Edit
            </button>
          )}
          <button
            className="cursor-pointer bg-red-800 text-white px-3 py-1 rounded m-4 hover:bg-red-600 transition-colors "
            onClick={handleDelete}
          >
            Remove
          </button>
        </div>
      </div>
      <p
        className="text-dark-brown/80 leading-relaxed whitespace-pre-wrap"
        style={{ width: "550px" }}
      >
        {entry.content}
      </p>
    </div>
  );
}
