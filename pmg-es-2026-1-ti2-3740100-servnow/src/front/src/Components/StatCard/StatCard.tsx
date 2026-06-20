import "./StatCard.css";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ size: number }>;
  color: "blue" | "green" | "orange" | "yellow";
}

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  color
}: StatCardProps) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">
        <Icon size={24} />
      </div>
      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <h3 className="stat-value">{value}</h3>
        <p className="stat-change">{change}</p>
      </div>
    </div>
  );
}
