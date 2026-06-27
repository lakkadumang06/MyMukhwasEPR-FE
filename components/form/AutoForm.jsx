'use client';
import { useForm } from 'react-hook-form';
import { Button, Input, Label, Select, Textarea } from '@/components/ui';

/**
 * Config-driven form.
 * fields: [{ name, label, type, options?, required?, placeholder?, step?, readOnly?, half? }]
 *   type: text | number | select | date | textarea | checkbox
 *   options: [{ value, label }]  (for select)
 * defaultValues: object (for edit)
 * onSubmit(values), submitting: bool
 */
/** Normalise stored values so the edit popup pre-fills every field correctly. */
function normalizeDefaults(fields, defaultValues = {}) {
  const out = { ...defaultValues };
  for (const f of fields) {
    const v = defaultValues[f.name];
    // Apply a field's configured default when creating (no stored value yet).
    if (v === undefined && f.default !== undefined) {
      out[f.name] = f.default;
      continue;
    }
    if (f.type === 'date' && v) {
      // `<input type="date">` needs YYYY-MM-DD; the API returns ISO datetimes.
      const d = new Date(v);
      out[f.name] = Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
    } else if (f.type === 'select' && v != null && typeof v === 'object') {
      // Reference fields may arrive populated — fall back to the _id for the option value.
      out[f.name] = v._id ?? v.value ?? '';
    } else if (f.type === 'number' && (v === null || v === undefined)) {
      out[f.name] = '';
    }
  }
  return out;
}

export function AutoForm({ fields, defaultValues = {}, onSubmit, submitting, submitLabel = 'Save' }) {
  const initialValues = normalizeDefaults(fields, defaultValues);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: initialValues });

  const coerce = (f, v) => {
    if (f.type === 'number') return v === '' || v === null ? undefined : Number(v);
    // An unselected optional dropdown submits '' — send undefined so the API
    // treats it as "not provided" instead of failing string validation.
    if (f.type === 'select') return v === '' ? undefined : v;
    if (f.type === 'checkbox') return Boolean(v);
    return v;
  };

  const submit = (values) => {
    const out = {};
    for (const f of fields) {
      if (f.readOnly) continue;
      out[f.name] = coerce(f, values[f.name]);
    }
    onSubmit(out);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <div key={f.name} className={f.half ? 'col-span-1' : 'col-span-1 sm:col-span-2'}>
          <Label className="mb-1 block">
            {f.label}
            {f.required ? <span className="text-danger"> *</span> : null}
          </Label>

          {f.type === 'select' ? (
            <Select
              defaultValue={initialValues[f.name] ?? ''}
              disabled={f.readOnly}
              {...register(f.name, { required: f.required })}
            >
              <option value="">— select —</option>
              {(f.options || []).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          ) : f.type === 'textarea' ? (
            <Textarea rows={3} disabled={f.readOnly} {...register(f.name, { required: f.required })} />
          ) : f.type === 'checkbox' ? (
            <input type="checkbox" className="h-4 w-4" {...register(f.name)} />
          ) : (
            <Input
              type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
              step={f.step}
              placeholder={f.placeholder}
              readOnly={f.readOnly}
              {...register(f.name, { required: f.required })}
            />
          )}

          {errors[f.name] ? (
            <p className="mt-1 text-xs text-danger">This field is required</p>
          ) : null}
        </div>
      ))}

      <div className="col-span-1 sm:col-span-2 mt-2 flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
