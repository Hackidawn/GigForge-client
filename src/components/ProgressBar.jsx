// client/src/components/ProgressBar.jsx
export default function ProgressBar({ value = 0 }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="w-40 h-2 bg-gray-200 rounded overflow-hidden">
      <div
        className="h-full bg-blue-500"
        style={{ width: `${v}%`, transition: 'width 300ms ease' }}
        title={`${v}%`}
      />
    </div>
  );
}
