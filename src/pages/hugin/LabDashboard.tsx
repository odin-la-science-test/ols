import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Beaker, FlaskConical, Microscope, Package,
  AlertTriangle, TrendingUp, TrendingDown, Activity, Calendar,
  Users, Target, BarChart3, Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { fetchModuleData } from '../../utils/persistence';
import type { DashboardData, Activity as ActivityType, Alert } from '../../types/lims';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { ResponsiveContainer, ResponsiveGrid } from '../../components/layout';

const LabDashboard = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useBreakpoint();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeRange]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Charger les données de tous les modules
      const samples = await fetchModuleData('lims_samples') || [];
      const experiments = await fetchModuleData('lims_experiments') || [];
      const equipment = await fetchModuleData('lims_equipment') || [];
      const inventory = await fetchModuleData('lab_inventory_v2') || [];

      // Calculer les KPIs
      const kpis = {
        totalSamples: samples.length,
        activeExperiments: experiments.filter((e: any) => e.status === 'in-progress').length,
        equipmentUsage: Math.round((equipment.filter((e: any) => e.status === 'in-use').length / Math.max(equipment.length, 1)) * 100),
        pendingTasks: 0, // À implémenter
        lowStockItems: inventory.filter((i: any) => i.status === 'Low' || i.status === 'Critical').length,
        upcomingMaintenance: equipment.filter((e: any) => {
          if (!e.nextMaintenance) return false;
          const daysUntil = Math.floor((new Date(e.nextMaintenance).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return daysUntil <= 7 && daysUntil >= 0;
        }).length
      };

      // Activité récente
      const recentActivity: ActivityType[] = [];

      // Alertes
      const alerts: Alert[] = [];
      
      // Alertes de stock faible
      inventory.filter((i: any) => i.status === 'Critical').forEach((item: any) => {
        alerts.push({
          id: `stock-${item.id}`,
          type: 'error',
          title: 'Stock critique',
          message: `${item.name}: ${item.quantity} ${item.unit} restant(s)`,
          timestamp: new Date().toISOString(),
          module: 'inventory',
          priority: 'high',
          acknowledged: false
        });
      });

      // Alertes de maintenance
      equipment.filter((e: any) => {
        if (!e.nextMaintenance) return false;
        const daysUntil = Math.floor((new Date(e.nextMaintenance).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 3 && daysUntil >= 0;
      }).forEach((eq: any) => {
        alerts.push({
          id: `maint-${eq.id}`,
          type: 'warning',
          title: 'Maintenance requise',
          message: `${eq.name} nécessite une maintenance dans ${Math.floor((new Date(eq.nextMaintenance).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} jour(s)`,
          timestamp: new Date().toISOString(),
          module: 'equipment',
          priority: 'medium',
          acknowledged: false
        });
      });

      setDashboardData({
        kpis,
        recentActivity,
        alerts,
        quickStats: {
          samplesThisWeek: samples.filter((s: any) => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(s.createdAt) > weekAgo;
          }).length,
          experimentsThisWeek: experiments.filter((e: any) => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(e.createdAt) > weekAgo;
          }).length,
          equipmentBookings: equipment.reduce((sum: number, e: any) => sum + (e.bookings?.length || 0), 0)
        }
      });
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !dashboardData) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ width: '50px', height: '50px', border: '3px solid rgba(167, 139, 250, 0.3)', borderTop: '3px solid #a78bfa', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p>Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: isMobile ? '1rem' : '2rem' }}>
      <ResponsiveContainer maxWidth="xl">
        {/* Header */}
        <div style={{ marginBottom: isMobile ? '1.5rem' : '2rem' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center', 
            gap: '1rem', 
            marginBottom: '0.5rem' 
          }}>
            <LayoutDashboard size={isMobile ? 28 : 36} color="var(--accent-hugin)" />
            <h1 style={{ 
              color: 'var(--text-primary)', 
              fontSize: isMobile ? '1.5rem' : '2rem', 
              fontWeight: '700', 
              margin: 0 
            }}>
              Dashboard Laboratoire
            </h1>
          </div>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: isMobile ? '0.875rem' : '0.95rem', 
            margin: 0 
          }}>
            Vue d'ensemble de l'activité et des ressources du laboratoire
          </p>
        </div>

        {/* KPIs Grid */}
        <ResponsiveGrid 
          columns={{ mobile: 1, tablet: 2, desktop: 3 }}
          gap={isMobile ? '1rem' : '1.5rem'}
          style={{ marginBottom: isMobile ? '1.5rem' : '2rem' }}
        >
          <KPICard
            icon={<Beaker size={28} />}
            label="Échantillons"
            value={dashboardData.kpis.totalSamples}
            trend={dashboardData.quickStats.samplesThisWeek}
            trendLabel="cette semaine"
            color="#3b82f6"
            onClick={() => navigate('/hugin/samples')}
          />
          <KPICard
            icon={<FlaskConical size={28} />}
            label="Expériences actives"
            value={dashboardData.kpis.activeExperiments}
            trend={dashboardData.quickStats.experimentsThisWeek}
            trendLabel="cette semaine"
            color="#8b5cf6"
            onClick={() => navigate('/hugin/experiments')}
          />
          <KPICard
            icon={<Microscope size={28} />}
            label="Utilisation équipements"
            value={`${dashboardData.kpis.equipmentUsage}%`}
            trend={dashboardData.quickStats.equipmentBookings}
            trendLabel="réservations"
            color="#10b981"
            onClick={() => navigate('/hugin/equipment')}
          />
          <KPICard
            icon={<Package size={28} />}
            label="Stock faible"
            value={dashboardData.kpis.lowStockItems}
            color="#f59e0b"
            alert={dashboardData.kpis.lowStockItems > 0}
            onClick={() => navigate('/hugin/inventory')}
          />
          <KPICard
            icon={<AlertTriangle size={28} />}
            label="Maintenance à venir"
            value={dashboardData.kpis.upcomingMaintenance}
            color="#ef4444"
            alert={dashboardData.kpis.upcomingMaintenance > 0}
            onClick={() => navigate('/hugin/equipment')}
          />
          <KPICard
            icon={<Target size={28} />}
            label="Tâches en attente"
            value={dashboardData.kpis.pendingTasks}
            color="#6366f1"
            onClick={() => navigate('/hugin/tasks')}
          />
        </ResponsiveGrid>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '2fr 1fr', 
          gap: isMobile ? '1rem' : '1.5rem', 
          marginBottom: isMobile ? '1.5rem' : '2rem' 
        }}>
          {/* Alertes */}
          <div className="glass-panel" style={{ padding: isMobile ? '1rem' : '1.5rem' }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between', 
              alignItems: isMobile ? 'flex-start' : 'center', 
              marginBottom: isMobile ? '1rem' : '1.5rem',
              gap: isMobile ? '0.5rem' : '0'
            }}>
              <h2 style={{ 
                color: 'var(--text-primary)', 
                fontSize: isMobile ? '1.125rem' : '1.25rem', 
                fontWeight: '600', 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem' 
              }}>
                <AlertTriangle size={20} color="#f59e0b" />
                Alertes ({dashboardData.alerts.length})
              </h2>
            </div>
            
            {dashboardData.alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>Aucune alerte active</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dashboardData.alerts.slice(0, 5).map(alert => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            )}
          </div>

          {/* Accès rapide */}
          <div className="glass-panel" style={{ padding: isMobile ? '1rem' : '1.5rem' }}>
            <h2 style={{ 
              color: 'var(--text-primary)', 
              fontSize: isMobile ? '1.125rem' : '1.25rem', 
              fontWeight: '600', 
              marginBottom: isMobile ? '1rem' : '1.5rem' 
            }}>
              Accès rapide
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <QuickAccessButton
                icon={<Beaker size={18} />}
                label="Nouvel échantillon"
                onClick={() => navigate('/hugin/samples?action=new')}
              />
              <QuickAccessButton
                icon={<FlaskConical size={18} />}
                label="Nouvelle expérience"
                onClick={() => navigate('/hugin/experiments?action=new')}
              />
              <QuickAccessButton
                icon={<Calendar size={18} />}
                label="Réserver équipement"
                onClick={() => navigate('/hugin/equipment?action=book')}
              />
              <QuickAccessButton
                icon={<Package size={18} />}
                label="Commander réactifs"
                onClick={() => navigate('/hugin/inventory?action=order')}
              />
              <QuickAccessButton
                icon={<BarChart3 size={18} />}
                label="Analyser données"
                onClick={() => navigate('/hugin/analysis')}
              />
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <div className="glass-panel" style={{ padding: isMobile ? '1rem' : '1.5rem' }}>
          <h2 style={{ 
            color: 'var(--text-primary)', 
            fontSize: isMobile ? '1.125rem' : '1.25rem', 
            fontWeight: '600', 
            marginBottom: isMobile ? '1rem' : '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem' 
          }}>
            <Activity size={20} color="var(--accent-hugin)" />
            Activité récente
          </h2>
          
          {dashboardData.recentActivity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>Aucune activité récente</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {dashboardData.recentActivity.slice(0, 10).map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </ResponsiveContainer>
    </div>
  );
};

// Composants auxiliaires
interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: number;
  trendLabel?: string;
  color: string;
  alert?: boolean;
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({ icon, label, value, trend, trendLabel, color, alert, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: 'rgba(255,255,255,0.02)',
      backdropFilter: 'blur(10px)',
      border: `1px solid ${alert ? '#ef4444' : 'var(--border-color)'}`,
      borderRadius: '1rem',
      padding: '1.5rem',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 8px 16px ${color}30`;
      }
    }}
    onMouseLeave={(e) => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '12px',
        background: `${color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          {label}
        </div>
        <div style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: '700' }}>
          {value}
        </div>
      </div>
    </div>
    {trend !== undefined && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        <TrendingUp size={14} color={color} />
        <span>{trend} {trendLabel}</span>
      </div>
    )}
  </div>
);

interface AlertCardProps {
  alert: Alert;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const getAlertColor = () => {
    switch (alert.type) {
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      padding: '1rem',
      background: `${getAlertColor()}10`,
      border: `1px solid ${getAlertColor()}30`,
      borderRadius: '0.5rem',
      display: 'flex',
      gap: '1rem'
    }}>
      <AlertTriangle size={20} color={getAlertColor()} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
      <div style={{ flex: 1 }}>
        <div style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.25rem' }}>
          {alert.title}
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {alert.message}
        </div>
      </div>
    </div>
  );
};

interface QuickAccessButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const QuickAccessButton: React.FC<QuickAccessButtonProps> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid var(--border-color)',
      borderRadius: '0.5rem',
      color: 'var(--text-primary)',
      cursor: 'pointer',
      transition: 'all 0.2s',
      width: '100%',
      textAlign: 'left',
      fontSize: '0.95rem'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(167, 139, 250, 0.1)';
      e.currentTarget.style.borderColor = 'var(--accent-hugin)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
      e.currentTarget.style.borderColor = 'var(--border-color)';
    }}
  >
    {icon}
    {label}
  </button>
);

interface ActivityItemProps {
  activity: ActivityType;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => (
  <div style={{
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '0.5rem',
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center'
  }}>
    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', minWidth: '80px' }}>
      {new Date(activity.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
    </div>
    <div style={{ flex: 1 }}>
      <span style={{ color: 'var(--text-primary)' }}>{activity.user}</span>
      <span style={{ color: 'var(--text-secondary)' }}> {activity.action} </span>
      <span style={{ color: 'var(--text-primary)' }}>{activity.details}</span>
    </div>
  </div>
);

export default LabDashboard;
