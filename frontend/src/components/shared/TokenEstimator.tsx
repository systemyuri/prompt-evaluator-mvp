interface Props {
  chosenFormat?: number;
  plainTextBaseline: number;
  overheadPercentage: number;
}

export default function TokenEstimator({ chosenFormat, plainTextBaseline, overheadPercentage }: Props) {
  if (chosenFormat == null) return null;
  const color = overheadPercentage > 25 ? '#c0392b' : overheadPercentage > 10 ? '#b8860b' : '#27ae60';
  return (
    <div style={{ padding: 12, background: '#f6f8fa', borderRadius: 8, fontSize: 13 }}>
      <div><b>Tokens estimados</b></div>
      <div>Formato elegido: {chosenFormat}</div>
      <div>Baseline (texto plano): {plainTextBaseline}</div>
      <div style={{ color, fontWeight: 'bold' }}>
        Sobrecarga: {overheadPercentage > 0 ? '+' : ''}{overheadPercentage}%
      </div>
    </div>
  );
}