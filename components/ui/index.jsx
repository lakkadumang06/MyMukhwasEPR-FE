'use client';
import { forwardRef, useState, useRef, useEffect, Children } from 'react';
import { cn } from '@/lib/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export function Button({ variant = 'primary', size = 'md', className, ...props }) {
  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white',
    secondary: 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700',
    danger: 'bg-danger hover:bg-red-800 text-white',
    ghost: 'hover:bg-slate-100 text-slate-600',
  };
  const sizes = { sm: 'px-2.5 py-1 text-xs', md: 'px-3.5 py-2 text-sm', lg: 'px-5 py-2.5' };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

// forwardRef is required so React Hook Form's register() ref attaches to the
// real DOM node — without it RHF can't set values and edit popups render blank.
export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 text-base sm:text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
        className,
      )}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select(
  { className, children, disabled, value, defaultValue, onChange, ...props },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value ?? defaultValue ?? '');
  const containerRef = useRef(null);

  // Parse children to extract options
  const options = Children.toArray(children)
    .map((child) => {
      if (child.type === 'option') {
        return { value: child.props.value, label: child.props.children };
      }
      return null;
    })
    .filter(Boolean);

  const selectedOption = options.find((o) => String(o.value) === String(internalValue)) || options[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync with external value if provided
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleSelect = (optionValue) => {
    setInternalValue(optionValue);
    setIsOpen(false);

    // Call the onChange prop provided by react-hook-form
    if (onChange) {
      onChange({
        target: { name: props.name, value: optionValue },
        type: 'change',
      });
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Hidden native select for react-hook-form to attach ref and validation */}
      <select
        ref={ref}
        className="sr-only"
        value={internalValue}
        onChange={(e) => handleSelect(e.target.value)}
        disabled={disabled}
        {...props}
      >
        {children}
      </select>

      {/* Custom UI */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-base sm:text-sm outline-none transition-all',
          'focus:border-brand-500 focus:ring-2 focus:ring-brand-100 hover:bg-slate-50',
          disabled && 'cursor-not-allowed opacity-50 hover:bg-white',
          className
        )}
      >
        <span className={cn('truncate', !internalValue && 'text-slate-500')}>
          {selectedOption ? selectedOption.label : '— select —'}
        </span>
        <ChevronDown
          className={cn('h-4 w-4 text-slate-500 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg shadow-slate-200/50"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'relative flex w-full cursor-pointer select-none items-center px-3 py-2 text-sm transition-colors hover:bg-brand-50 hover:text-brand-700',
                  String(option.value) === String(internalValue)
                    ? 'bg-brand-50 font-medium text-brand-700'
                    : 'text-slate-700'
                )}
              >
                <span className="truncate pr-6">{option.label}</span>
                {String(option.value) === String(internalValue) && (
                  <Check className="absolute right-3 h-4 w-4 text-brand-600" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 text-base sm:text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
        className,
      )}
      {...props}
    />
  );
});

export function Label({ className, ...props }) {
  return <label className={cn('text-sm font-medium text-slate-600', className)} {...props} />;
}

export function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-xl border border-slate-200 bg-white shadow-sm', className)}
      {...props}
    />
  );
}
