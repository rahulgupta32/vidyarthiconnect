import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helperText?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <Label>{label}</Label>}
        <input
          ref={ref}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 
            bg-white text-slate-900 placeholder:text-slate-500 border-slate-350 focus:border-indigo-500 focus:ring-indigo-500/30 
            dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400 dark:border-slate-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40 
            ${error ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20" : ""} 
            ${className}`}
          {...props}
        />
        {error && <FormError>{error}</FormError>}
        {helperText && !error && <FormHelperText>{helperText}</FormHelperText>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  helperText?: string;
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <Label>{label}</Label>}
        <textarea
          ref={ref}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 
            bg-white text-slate-900 placeholder:text-slate-500 border-slate-350 focus:border-indigo-500 focus:ring-indigo-500/30 
            dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400 dark:border-slate-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40 
            ${error ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20" : ""} 
            ${className}`}
          {...props}
        />
        {error && <FormError>{error}</FormError>}
        {helperText && !error && <FormHelperText>{helperText}</FormHelperText>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  helperText?: string;
  label?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", label, error, helperText, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <Label>{label}</Label>}
        <select
          ref={ref}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 
            bg-white text-slate-900 border-slate-350 focus:border-indigo-500 focus:ring-indigo-500/30 
            dark:bg-slate-950 dark:text-white dark:border-slate-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40 
            ${error ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20" : ""} 
            ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <FormError>{error}</FormError>}
        {helperText && !error && <FormHelperText>{helperText}</FormHelperText>}
      </div>
    );
  }
);
Select.displayName = "Select";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({ className = "", children, ...props }) => {
  return (
    <label
      className={`text-sm font-semibold mb-1.5 block text-slate-700 dark:text-slate-200 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "cta" | "danger" | "ghost";
}

export const Button: React.FC<ButtonProps> = ({
  className = "",
  variant = "primary",
  children,
  ...props
}) => {
  let baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm py-2.5 px-4";
  let variantStyles = "";

  if (variant === "primary") {
    variantStyles = "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500/40";
  } else if (variant === "secondary") {
    variantStyles = "bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 focus:ring-slate-500/30";
  } else if (variant === "cta") {
    baseStyles = "inline-flex items-center justify-center rounded-full shadow-lg transition focus:outline-none focus:ring-4 focus:ring-white/50 cursor-pointer text-base";
    variantStyles = "bg-white text-indigo-700 font-bold px-8 py-4 hover:bg-slate-100 ring-2 ring-white/40";
  } else if (variant === "danger") {
    variantStyles = "bg-red-650 text-white hover:bg-red-550 focus:ring-red-500/40";
  } else if (variant === "ghost") {
    variantStyles = "bg-transparent text-slate-600 hover:bg-slate-105 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-white focus:ring-transparent";
  }

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const FormError: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-1.5">{children}</p>;
};

export const FormHelperText: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">{children}</p>;
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className = "", children, ...props }) => {
  return (
    <div
      className={`bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidthClass = "max-w-lg",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="fixed inset-0" onClick={onClose}></div>
      <div
        className={`bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 rounded-2xl shadow-lg w-full relative z-10 ${maxWidthClass}`}
      >
        {title && (
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-zinc-850 pb-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition text-lg font-extrabold cursor-pointer"
            >
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
