"use client";

export interface FieldProps {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}

export function Field({ name, label, type = "text", required, value, onChange }: FieldProps) {
  return (
    <div className="mt-5">
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}{required ? <span className="ml-1 text-ember">*</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-sand bg-cream px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/30"
      />
    </div>
  );
}

export interface TextAreaProps {
  name: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

export function TextArea({ name, label, required, value, onChange, rows = 5 }: TextAreaProps) {
  return (
    <div className="mt-5">
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}{required ? <span className="ml-1 text-ember">*</span> : null}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-sand bg-cream px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/30"
      />
    </div>
  );
}
