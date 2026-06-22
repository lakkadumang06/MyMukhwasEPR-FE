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
export function AutoForm({ fields, defaultValues = {}, onSubmit, submitting, submitLabel = 'Save' }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  const coerce = (f, v) => {
    if (f.type === 'number') return v === '' || v === null ? undefined : Number(v);
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
    <form onSubmit={handleSubmit(submit)} className="grid grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.name} className={f.half ? 'col-span-1' : 'col-span-2'}>
          <Label className="mb-1 block">
            {f.label}
            {f.required ? <span className="text-danger"> *</span> : null}
          </Label>

          {f.type === 'select' ? (
            <Select
              defaultValue={defaultValues[f.name] ?? ''}
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

      <div className="col-span-2 mt-2 flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
