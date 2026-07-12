import React from 'react';

interface InlineEditControlsProps {
  onEdit: () => void;
  onAdd?: () => void;
  onDelete?: () => void;
}

const InlineEditControls: React.FC<InlineEditControlsProps> = ({ onEdit, onAdd, onDelete }) => {
  return (
    <div className="flex gap-2 p-1 bg-surface/90 backdrop-blur-md rounded-full shadow-lg border border-outline">
      {onAdd && (
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-colors"
          title="Add New Item"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-colors"
        title="Edit Item"
      >
        <span className="material-symbols-outlined text-[18px]">edit</span>
      </button>
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
          title="Delete Item"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      )}
    </div>
  );
};

export default InlineEditControls;
