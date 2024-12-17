import { cn } from '@/lib/utils';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function ToggleSwitch({
  label,
  checked,
  onChange,
  description,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-start">
      <div className="flex flex-col flex-grow">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        {description && (
          <span className="text-sm text-gray-500">{description}</span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          checked ? 'bg-blue-600' : 'bg-gray-200'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}