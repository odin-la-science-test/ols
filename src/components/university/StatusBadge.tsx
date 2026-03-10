interface StatusBadgeProps {
  status: string;
  label?: string;
}

export const StatusBadge = ({ status, label }: StatusBadgeProps) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: '#10b981',
      completed: '#3b82f6',
      pending: '#f59e0b',
      cancelled: '#ef4444',
      draft: '#6b7280',
      approved: '#10b981',
      rejected: '#ef4444',
      under_review: '#f59e0b',
      scheduled: '#3b82f6',
      in_progress: '#8b5cf6',
      overdue: '#ef4444',
      compliant: '#10b981',
      partial: '#f59e0b',
      non_compliant: '#ef4444'
    };
    return colors[status] || '#6366f1';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Actif',
      completed: 'Terminé',
      pending: 'En attente',
      cancelled: 'Annulé',
      draft: 'Brouillon',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      under_review: 'En révision',
      scheduled: 'Planifié',
      in_progress: 'En cours',
      overdue: 'En retard',
      compliant: 'Conforme',
      partial: 'Partiel',
      non_compliant: 'Non conforme'
    };
    return labels[status] || status;
  };

  const color = getStatusColor(status);
  const displayLabel = label || getStatusLabel(status);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.75rem',
        background: `${color}20`,
        border: `1px solid ${color}`,
        borderRadius: '1rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: color
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: color,
          marginRight: '0.5rem'
        }}
      />
      {displayLabel}
    </span>
  );
};
