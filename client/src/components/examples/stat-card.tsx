import { StatCard } from '../stat-card';
import { CheckSquare, Clock, AlertCircle, Users } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Tasks Completed"
        value={42}
        change={12.5}
        icon={CheckSquare}
        iconColor="text-green-600"
      />
      <StatCard
        title="In Progress"
        value={18}
        change={-5}
        icon={Clock}
        iconColor="text-blue-600"
      />
      <StatCard
        title="Overdue"
        value={3}
        icon={AlertCircle}
        iconColor="text-red-600"
      />
      <StatCard
        title="Team Members"
        value={4}
        icon={Users}
        iconColor="text-purple-600"
      />
    </div>
  );
}
