# Correction de l'affichage des cours multi-heures dans Smart Timetabling

## Problème
Les cours qui durent plusieurs heures (par exemple 08:00-10:00) ne s'affichent que sur une seule ligne de 30 minutes au lieu de s'étendre visuellement sur toute leur durée.

## Cause
La logique actuelle utilise `isStartOfSlot` pour n'afficher le créneau que sur la première ligne, mais le `minHeight` calculé ne fonctionne pas correctement dans une grille CSS.

## Solution
Utiliser un positionnement absolu pour les créneaux afin qu'ils puissent s'étendre librement sur plusieurs lignes.

## Modifications à apporter

### Étape 1: Modifier la section "Vue Semaine" (ligne ~432)

Remplacer la boucle `{timeSlots.filter((_, i) => i % 2 === 0).map((time, index) => {` par:

```tsx
<div style={{ position: 'relative', minHeight: '1600px' }}>
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
</div>
```

## Explication de la solution

1. **Grille de fond**: On crée d'abord une grille statique avec toutes les lignes horaires et colonnes de jours
2. **Positionnement absolu**: Les créneaux sont ensuite positionnés en absolu par-dessus la grille
3. **Calcul de position**: 
   - `topPosition`: Calculé en fonction de l'heure de début (08:00 = 0px, 09:00 = 160px, etc.)
   - `height`: Calculé avec la fonction existante `calculateSlotHeight()`
4. **Largeur dynamique**: Utilise `calc()` pour diviser l'espace en 6 colonnes égales
5. **Z-index**: Permet aux créneaux de se superposer si nécessaire et d'avoir un effet hover

## Résultat attendu

- Un cours de 08:00 à 10:00 (2h) s'affichera sur 320px de hauteur (2h × 160px/h)
- Un cours de 10:00 à 12:00 (2h) s'affichera également sur 320px
- Un cours de 14:00 à 17:00 (3h) s'affichera sur 480px de hauteur

## Test

Avec les données mock actuelles:
- "Biologie Moléculaire" (08:00-10:00) devrait s'étendre sur 2 heures
- "TP Biologie" (10:00-12:00) devrait s'étendre sur 2 heures  
- "TP Biologie" du jeudi (14:00-17:00) devrait s'étendre sur 3 heures
