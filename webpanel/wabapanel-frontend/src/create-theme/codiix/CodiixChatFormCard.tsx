import React, { useEffect, useMemo, useState } from 'react';
import type { CodiixChatForm } from './codiix-chat-form';

type Props = {
  form: CodiixChatForm;
  onSubmit: (values: Record<string, string>) => void | Promise<void>;
};

export function CodiixChatFormCard({ form, onSubmit }: Props) {
  const initialValues = useMemo(() => {
    const next: Record<string, string> = {};
    for (const field of form.fields) {
      next[field.id] = field.defaultValue ?? '';
    }
    return next;
  }, [form.fields]);

  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const status = form.status ?? 'idle';
  const locked = status === 'submitting' || status === 'done';

  useEffect(() => {
    setValues(initialValues);
  }, [form.id, initialValues]);

  if (status === 'done') {
    return null;
  }

  const missingRequired = form.fields.some(
    (field) => field.required && !(values[field.id] ?? '').trim(),
  );

  return (
    <form
      className="codiix-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (locked || missingRequired) return;
        void onSubmit(values);
      }}
    >
      <p className="codiix-form__title">{form.title}</p>
      <div className="codiix-form__fields">
        {form.fields.map((field) => {
          const inputId = `${form.id}-${field.id}`;
          return (
            <label key={field.id} className="codiix-form__field" htmlFor={inputId}>
              <span className="codiix-form__label">
                {field.label}
                {field.required ? <span className="codiix-form__req">*</span> : null}
              </span>
              {field.type === 'select' ? (
                <select
                  id={inputId}
                  className="codiix-form__control"
                  value={values[field.id] ?? ''}
                  disabled={locked}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                  }
                >
                  {(field.options ?? []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  id={inputId}
                  className="codiix-form__control codiix-form__control--area"
                  rows={3}
                  value={values[field.id] ?? ''}
                  disabled={locked}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                  }
                />
              ) : (
                <input
                  id={inputId}
                  type="text"
                  className="codiix-form__control"
                  value={values[field.id] ?? ''}
                  disabled={locked}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                  }
                />
              )}
              {field.help ? <span className="codiix-form__help">{field.help}</span> : null}
            </label>
          );
        })}
      </div>
      {status === 'error' && form.errorMessage ? (
        <p className="codiix-form__error" role="alert">
          {form.errorMessage}
        </p>
      ) : null}
      <button
        type="submit"
        className="codiix-form__submit"
        disabled={locked || missingRequired}
      >
        {status === 'submitting' ? 'Creating…' : form.submitLabel}
      </button>
    </form>
  );
}
