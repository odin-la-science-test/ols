#!/usr/bin/env python3
import re

# Lire le fichier
with open('src/pages/hugin/university/SmartTimetabling.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Backup
with open('src/pages/hugin/university/SmartTimetabling.tsx.bak4', 'w', encoding='utf-8') as f:
    f.write(content)
print("Backup créé: SmartTimetabling.tsx.bak4")

# Trouver la section à remplacer
start_pattern = r'{timeSlots\.filter\(\(_, i\) => i % 2 === 0\)\.map\(\(time, index\) => {'
end_pattern = r'\)\)\}'

# Trouver le début
start_match = re.search(start_pattern, content)
if not start_match:
    print("ERREUR: Pattern de début non trouvé!")
    exit(1)

start_pos = start_match.start()
print(f"Début trouvé à la position {start_pos}")

# Trouver la fin - chercher le 2ème "))} après le début
search_from = start_match.end()
closing_count = 0
end_pos = -1

for i in range(search_from, len(content) - 2):
    if content[i:i+3] == '))}':
        closing_count += 1
        if closing_count == 2:
            end_pos = i + 3
            break

if end_pos == -1:
    print("ERREUR: Pattern de fin non trouvé!")
    exit(1)

print(f"Fin trouvée à la position {end_pos}")

# Nouveau code avec indentation correcte
new_code = '''<div style={{ position: 'relative', minHeight: '1600px' }}>
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
                          top: `${topPosition}px`,
                          left: `calc(80px + ${dayIndex} * (100% - 80px) / 6 + ${dayIndex * 0.5}rem)`,
                          width: `calc((100% - 80px) / 6 - 0.5rem)`,
                          height: `${height}px`,
                          padding: '0.75rem',
                          background: `${getTypeColor(slot.type)}20`,
                          border: `2px solid ${getTypeColor(slot.type)}`,
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
                          e.currentTarget.style.boxShadow = `0 8px 32px ${getTypeColor(slot.type)}40`;
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
              </div>'''

# Construire le nouveau contenu
# On garde l'indentation avant le début
indent_start = start_pos
while indent_start > 0 and content[indent_start-1] in ' \t':
    indent_start -= 1

before = content[:indent_start]
after = content[end_pos:]
new_content = before + new_code + after

# Écrire le fichier
with open('src/pages/hugin/university/SmartTimetabling.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Fichier modifié avec succès!")
print(f"Section remplacée: {start_pos} -> {end_pos}")
print(f"Ancienne taille: {len(content)} caractères")
print(f"Nouvelle taille: {len(new_content)} caractères")
