'use client';
import { useFormState, useFormStatus } from 'react-dom';

export function Msg({ state }) {
  if (!state) return null;
  if (state.error) return <p className="err">{state.error}</p>;
  if (state.ok) return <p className="ok">{state.ok}</p>;
  return null;
}

export function Submit({ children = 'Guardar cambios', variant = 'btn-primary', ...rest }) {
  const { pending } = useFormStatus();
  return <button className={'btn ' + variant} disabled={pending} {...rest}>{pending ? 'Guardando…' : children}</button>;
}

/** Formulario con estado de server action + mensaje de resultado. */
export function ActionForm({ action, children, className, ...rest }) {
  const [state, dispatch] = useFormState(action, null);
  return (
    <form action={dispatch} className={className} {...rest}>
      <Msg state={state} />
      {children}
    </form>
  );
}

export function Field({ label, hint, children }) {
  return (
    <div className="f">
      <label>{label}{hint && <span className="hint"> — {hint}</span>}</label>
      {children}
    </div>
  );
}

export function Text({ label, hint, ...p }) {
  return <Field label={label} hint={hint}><input {...p} /></Field>;
}

export function Area({ label, hint, ...p }) {
  return <Field label={label} hint={hint}><textarea {...p} /></Field>;
}

export function Check({ label, ...p }) {
  return (
    <div className="f-row">
      <input type="checkbox" id={p.name + (p.value || '')} {...p} />
      <label htmlFor={p.name + (p.value || '')}>{label}</label>
    </div>
  );
}

export function Color({ label, hint, name, defaultValue }) {
  return (
    <Field label={label} hint={hint}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input type="color" name={name} defaultValue={defaultValue} style={{ width: 58, flex: '0 0 58px' }}
          onChange={(e) => { const t = e.target.form?.elements[name + '_hex']; if (t) t.value = e.target.value; }} />
        <input name={name + '_hex'} defaultValue={defaultValue} aria-label={label + ' hex'}
          onChange={(e) => { const c = e.target.form?.elements[name]; if (c && /^#[0-9a-f]{6}$/i.test(e.target.value)) c.value = e.target.value; }} />
      </div>
    </Field>
  );
}
