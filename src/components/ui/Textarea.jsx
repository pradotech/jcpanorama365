import { forwardRef } from 'react';

const Textarea = forwardRef(function Textarea({
  label,
  error,
  rows = 3,
  className = '',
  ...props
}, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-navy-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full px-4 py-2.5 rounded-lg border border-navy-200 bg-white text-navy-900 placeholder-navy-400 text-base sm:text-sm leading-relaxed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent resize-y break-words ${error ? 'border-red-400 focus:ring-red-400' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 mt-0.5">{error}</span>
      )}
    </div>
  );
});

export default Textarea;
