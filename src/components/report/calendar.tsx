function Legend() {
  return (
    <div className="flex items-center gap-4">
      <Swatch
        color="rgba(239,68,68,0.2)"
        border="rgba(220,38,38,0.6)"
        label="FULL"
      />
      <Swatch
        color="rgba(245,158,11,0.2)"
        border="rgba(202,138,4,0.6)"
        label="Peak (tersedia)"
      />
      <Swatch
        color="rgba(34,197,94,0.2)"
        border="rgba(22,163,74,0.6)"
        label="Available"
      />
    </div>
  );
}

function Swatch({
  color,
  border,
  label,
}: {
  color: string;
  border: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <i
        className="inline-block w-4 h-3 rounded-sm"
        style={{ background: color, border: `1px solid ${border}` }}
      />
      {label}
    </span>
  );
}

export default { Legend, Swatch };
