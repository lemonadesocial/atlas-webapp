"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, className = "", id, ...props }, ref) {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`rounded-md border border-card-border bg-card px-3 py-2 text-sm text-primary placeholder:text-quaternary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-colors ${className}`}
          {...props}
        />
      </div>
    );
  }
);
