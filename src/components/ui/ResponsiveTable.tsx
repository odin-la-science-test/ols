import React, { useState } from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { ChevronRight } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  priority?: 'high' | 'medium' | 'low'; // high = always visible, low = hidden on mobile
  render?: (value: any, row: any) => React.ReactNode;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  keyField?: string;
  onRowClick?: (row: any) => void;
  mobileView?: 'cards' | 'scroll';
  className?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  keyField = 'id',
  onRowClick,
  mobileView = 'cards',
  className = '',
}) => {
  const { isMobile } = useBreakpoint();

  // Filter columns based on priority for mobile
  const visibleColumns = isMobile
    ? columns.filter((col) => col.priority !== 'low')
    : columns;

  if (isMobile && mobileView === 'cards') {
    return <CardView columns={columns} data={data} keyField={keyField} onRowClick={onRowClick} />;
  }

  return (
    <div
      className={`responsive-table-wrapper ${className}`}
      style={{
        width: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: isMobile ? '600px' : 'auto',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: 'rgba(167, 139, 250, 0.1)',
              borderBottom: '2px solid var(--border-color)',
            }}
          >
            {visibleColumns.map((column) => (
              <th
                key={column.key}
                style={{
                  padding: isMobile ? '0.75rem' : '1rem',
                  textAlign: 'left',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  fontSize: isMobile ? '0.875rem' : '0.95rem',
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row[keyField] || index}
              onClick={() => onRowClick?.(row)}
              style={{
                borderBottom: '1px solid var(--border-color)',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (onRowClick && !isMobile) {
                  e.currentTarget.style.backgroundColor = 'rgba(167, 139, 250, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (onRowClick && !isMobile) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {visibleColumns.map((column) => (
                <td
                  key={column.key}
                  style={{
                    padding: isMobile ? '0.75rem' : '1rem',
                    color: 'var(--text-primary)',
                    fontSize: isMobile ? '0.875rem' : '0.95rem',
                  }}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Card view for mobile
const CardView: React.FC<{
  columns: Column[];
  data: any[];
  keyField: string;
  onRowClick?: (row: any) => void;
}> = ({ columns, data, keyField, onRowClick }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {data.map((row, index) => (
        <div
          key={row[keyField] || index}
          onClick={() => onRowClick?.(row)}
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '1rem',
            cursor: onRowClick ? 'pointer' : 'default',
          }}
        >
          {columns
            .filter((col) => col.priority !== 'low')
            .map((column) => (
              <div
                key={column.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <span
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                  }}
                >
                  {column.label}
                </span>
                <span
                  style={{
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    textAlign: 'right',
                  }}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </span>
              </div>
            ))}
          {onRowClick && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '0.5rem',
              }}
            >
              <ChevronRight size={20} color="var(--accent-hugin)" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ResponsiveTable;
