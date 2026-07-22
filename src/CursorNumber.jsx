


export default function CursorNumber({ z }) {
  if (!z) return null;
  return (
    <div className="cursor-number">
      z = {z.re >= 0 ? "" : "- "} {Math.abs(z.re).toFixed(4)} {z.im >= 0 ? "+" : "-"} {Math.abs(z.im).toFixed(4)}i
    </div>
  );
}