'use client';

export default function SortSelect({ searchParams = {} }) {
  return (
    <form>
      {Object.entries(searchParams)
        .filter(([k, v]) => k !== 'orden' && v)
        .map(([k, v]) => <input key={k} type="hidden" name={k} value={String(v)} />)}
      <select
        className="select"
        name="orden"
        defaultValue={searchParams.orden || ''}
        onChange={(e) => e.currentTarget.form.submit()}
      >
        <option value="">Orden: relevancia</option>
        <option value="nuevo">Más nuevos</option>
        <option value="precio-asc">Precio: menor a mayor</option>
        <option value="precio-desc">Precio: mayor a menor</option>
      </select>
    </form>
  );
}
