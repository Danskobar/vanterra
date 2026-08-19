import logo from '../assets/vanterra-logo.png';

export default function Logo({ size = 28, withWordmark = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img src={logo} alt="VANTERRA" style={{ width: size, height: size }} className="shrink-0" />
      {withWordmark && (
        <span className="font-semibold tracking-tight text-[var(--v-white)]" style={{ fontSize: size * 0.55 }}>
          Vanterra
        </span>
      )}
    </div>
  );
}
