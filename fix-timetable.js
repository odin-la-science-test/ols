const fs = require('fs');

const file = 'src/pages/hugin/university/SmartTimetabling.tsx';
let content = fs.readFileSync(file, 'utf8');

// Trouver le début de la section à remplacer
const startMarker = '{timeSlots.filter((_, i) => i % 2 === 0).map((time, index) => {';
const endMarker = '))}';

const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error('Marqueur de début non trouvé!');
  process.exit(1);
}

// Trouver la fin - on cherche le deuxième "))})" après le début
let searchFrom = startIndex + startMarker.length;
let endIndex = -1;
let closingCount = 0;

for (let i = searchFrom; i < content.length - 2; i++) {
  if (content.substring(i, i + 3) === '))}') {
    closingCount++;
    if (closingCount === 2) {
      endIndex = i + 3;
      break;
    }
  }
}

if (endIndex === -1) {
  console.error('Marqueur de fin non trouvé!');
  process.exit(1);
}

console.log(`Trouvé section de ${startIndex} à ${endIndex}`);

// Nouveau code
const newCode = `<div style={{ position: 'relative', minHeight: '1600px' }}>
                {/* Grille de fond */}
                {timeSlots.filter((_, i) => i % 2 === 0).map((time, index) => (
                  <div
                    key={time}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px repeat(6, 1fr)',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                      minHeight: '80px'
                    }}
                  >
                    <div style={{ 
                      color: 'var(--text-secondary)', 
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      paddingTop: '0.5rem'
                    }}>
                      {time}
                    </div>
                    {days.map((day) => (
                      <div
                        key={day.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '0.5rem',
                          border: '1px dashed rgba(255, 255, 255, 0.1)',
                          position: 'relative'
                        }}
                      />
                    ))}
                  </div>
                ))}
                
                {/* Overlay des créneaux avec positionnement absolu */}
                {days.map((day, dayIndex) => {
                  const daySlots = filteredTimetable.filter(slot => slot.day === day.id);
                  
                  return daySlots.map(slot => {
                    const startHour = parseInt(slot.startTime.split(':')[0]);
                    const startMin = parseInt(slot.startTime.split(':')[1]);
                    const startTotalMin = startHour * 60 + startMin;
                    const baseTime = 8 * 60;
                    const offsetMin = startTotalMin - baseTime;
                    const topPosition = (offsetMin / 60) * 160;
                    const height = calculateSlotHeight(slot.startTime, slot.endTime);
                    
                    return (
                      <div
                        key={slot.id}
                        style={{
                          position: 'absolute',
                          top: \`\${topPosition}px\`,
                          left: \`calc(80px + \${dayIndex} * (100% - 80px) / 6 + \${dayIndex * 0.5}rem)\`,
                          width: \`calc((100% - 80px) / 6 - 0.5rem)\`,
                          height: \`\${height}px\`,
                          padding: '0.75rem',
                          background: \`\${getTypeColor(slot.type)}20\`,
                          border: \`2px solid \${getTypeColor(slot.type)}\`,
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          zIndex: 10,
                          overflow: 'hidden'
                        }}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setShowEditModal(true);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = \`0 8px 32px \${getTypeColor(slot.type)}40\`;
                          e.currentTarget.style.zIndex = '20';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.zIndex = '10';
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                            {slot.courseName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                            {slot.teacherName}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            {slot.roomName}
                          </div>
                        </div>
                        
                        <span style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          padding: '0.15rem 0.5rem',
                          background: getTypeColor(slot.type),
                          borderRadius: '0.75rem',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          color: 'white'
                        }}>
                          {slot.type}
                        </span>
                        
                        {slot.conflicts.length > 0 && (
                          <div style={{
                            position: 'absolute',
                            bottom: '0.5rem',
                            right: '0.5rem'
                          }}>
                            <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                          </div>
                        )}
                      </div>
                    );
                  });
                })}
              </div>`;

// Backup
fs.writeFileSync(file + '.bak3', content);
console.log('Backup créé: ' + file + '.bak3');

// Remplacer
const before = content.substring(0, startIndex - 14); // -14 pour inclure les espaces avant
const after = content.substring(endIndex);
const newContent = before + newCode + after;

fs.writeFileSync(file, newContent);
console.log('Fichier modifié avec succès!');
