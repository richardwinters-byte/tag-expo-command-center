'use client';

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-outline btn-sm no-print">
      Print PDF
    </button>
  );
}
