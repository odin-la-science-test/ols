$file = "src/pages/hugin/university/SmartTimetabling.tsx"
$content = Get-Content $file -Raw

# Trouver et remplacer la section problématique
$oldPattern = @'
              {timeSlots.filter\(\(_, i\) => i % 2 === 0\).map\(\(time, index\) => {
                const rowSlots = days.map\(day => getSlotForTime\(day.id, time\)\);
'@

Write-Host "Lecture du fichier..." -ForegroundColor Cyan
Write-Host "Taille: $($content.Length) caractères" -ForegroundColor Yellow

# Backup
Copy-Item $file "$file.bak2" -Force
Write-Host "Backup créé: $file.bak2" -ForegroundColor Green

# Remplacement manuel ligne par ligne
$lines = Get-Content $file
$newLines = @()
$inReplaceSection = $false
$skipUntilClosing = 0

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    
    # Détecter le début de la section à remplacer
    if ($line -match 'timeSlots\.filter\(\(_, i\) => i % 2 === 0\)\.map\(\(time, index\) => {') {
        Write-Host "Trouvé à la ligne $i" -ForegroundColor Yellow
        $inReplaceSection = $true
        
        # Insérer le nouveau code
        $newLines += '              <div style={{ position: ''relative'', minHeight: ''1600px'' }}>'
        $newLines += '                {/* Grille de fond */}'
        $newLines += '                {timeSlots.filter((_, i) => i % 2 === 0).map((time, index) => ('
        $newLines += '                  <div'
        $newLines += '                    key={time}'
        $newLines += '                    style={{'
        $newLines += '                      display: ''grid'','
        $newLines += '                      gridTemplateColumns: ''80px repeat(6, 1fr)'','
        $newLines += '                      gap: ''0.5rem'','
        $newLines += '                      marginBottom: ''0.5rem'','
        $newLines += '                      minHeight: ''80px'''
        $newLines += '                    }}'
        $newLines += '                  >'
        $newLines += '                    <div style={{ '
        $newLines += '                      color: ''var(--text-secondary)'', '
        $newLines += '                      fontWeight: 600,'
        $newLines += '                      fontSize: ''0.85rem'','
        $newLines += '                      paddingTop: ''0.5rem'''
        $newLines += '                    }}>'
        $newLines += '                      {time}'
        $newLines += '                    </div>'
        $newLines += '                    {days.map((day) => ('
        $newLines += '                      <div'
        $newLines += '                        key={day.id}'
        $newLines += '                        style={{'
        $newLines += '                          background: ''rgba(255, 255, 255, 0.02)'','
        $newLines += '                          borderRadius: ''0.5rem'','
        $newLines += '                          border: ''1px dashed rgba(255, 255, 255, 0.1)'','
        $newLines += '                          position: ''relative'''
        $newLines += '                        }}'
        $newLines += '                      />'
        $newLines += '                    ))}'
        $newLines += '                  </div>'
        $newLines += '                ))}'
        $newLines += '                '
        $newLines += '                {/* Overlay des créneaux avec positionnement absolu */}'
        $newLines += '                {days.map((day, dayIndex) => {'
        $newLines += '                  const daySlots = filteredTimetable.filter(slot => slot.day === day.id);'
        $newLines += '                  '
        $newLines += '                  return daySlots.map(slot => {'
        $newLines += '                    const startHour = parseInt(slot.startTime.split('':'')[0]);'
        $newLines += '                    const startMin = parseInt(slot.startTime.split('':'')[1]);'
        $newLines += '                    const startTotalMin = startHour * 60 + startMin;'
        $newLines += '                    const baseTime = 8 * 60;'
        $newLines += '                    const offsetMin = startTotalMin - baseTime;'
        $newLines += '                    const topPosition = (offsetMin / 60) * 160;'
        $newLines += '                    const height = calculateSlotHeight(slot.startTime, slot.endTime);'
        $newLines += '                    '
        $newLines += '                    return ('
        $newLines += '                      <div'
        $newLines += '                        key={slot.id}'
        $newLines += '                        style={{'
        $newLines += '                          position: ''absolute'','
        $newLines += '                          top: `${topPosition}px`,'
        $newLines += '                          left: `calc(80px + ${dayIndex} * (100% - 80px) / 6 + ${dayIndex * 0.5}rem)`,'
        $newLines += '                          width: `calc((100% - 80px) / 6 - 0.5rem)`,'
        $newLines += '                          height: `${height}px`,'
        $newLines += '                          padding: ''0.75rem'','
        $newLines += '                          background: `${getTypeColor(slot.type)}20`,'
        $newLines += '                          border: `2px solid ${getTypeColor(slot.type)}`,'
        $newLines += '                          borderRadius: ''0.5rem'','
        $newLines += '                          cursor: ''pointer'','
        $newLines += '                          transition: ''transform 0.2s, box-shadow 0.2s'','
        $newLines += '                          display: ''flex'','
        $newLines += '                          flexDirection: ''column'','
        $newLines += '                          justifyContent: ''space-between'','
        $newLines += '                          zIndex: 10,'
        $newLines += '                          overflow: ''hidden'''
        $newLines += '                        }}'
        $newLines += '                        onClick={() => {'
        $newLines += '                          setSelectedSlot(slot);'
        $newLines += '                          setShowEditModal(true);'
        $newLines += '                        }}'
        $newLines += '                        onMouseEnter={(e) => {'
        $newLines += '                          e.currentTarget.style.transform = ''scale(1.02)'';'
        $newLines += '                          e.currentTarget.style.boxShadow = `0 8px 32px ${getTypeColor(slot.type)}40`;'
        $newLines += '                          e.currentTarget.style.zIndex = ''20'';'
        $newLines += '                        }}'
        $newLines += '                        onMouseLeave={(e) => {'
        $newLines += '                          e.currentTarget.style.transform = ''scale(1)'';'
        $newLines += '                          e.currentTarget.style.boxShadow = ''none'';'
        $newLines += '                          e.currentTarget.style.zIndex = ''10'';'
        $newLines += '                        }}'
        $newLines += '                      >'
        $newLines += '                        <div>'
        $newLines += '                          <div style={{ fontSize: ''0.85rem'', fontWeight: 700, marginBottom: ''0.25rem'' }}>'
        $newLines += '                            {slot.courseName}'
        $newLines += '                          </div>'
        $newLines += '                          <div style={{ fontSize: ''0.75rem'', color: ''var(--text-secondary)'', marginBottom: ''0.25rem'' }}>'
        $newLines += '                            {slot.teacherName}'
        $newLines += '                          </div>'
        $newLines += '                          <div style={{ fontSize: ''0.7rem'', color: ''var(--text-secondary)'' }}>'
        $newLines += '                            {slot.roomName}'
        $newLines += '                          </div>'
        $newLines += '                        </div>'
        $newLines += '                        '
        $newLines += '                        <span style={{'
        $newLines += '                          position: ''absolute'','
        $newLines += '                          top: ''0.5rem'','
        $newLines += '                          right: ''0.5rem'','
        $newLines += '                          padding: ''0.15rem 0.5rem'','
        $newLines += '                          background: getTypeColor(slot.type),'
        $newLines += '                          borderRadius: ''0.75rem'','
        $newLines += '                          fontSize: ''0.65rem'','
        $newLines += '                          fontWeight: 700,'
        $newLines += '                          color: ''white'''
        $newLines += '                        }}>'
        $newLines += '                          {slot.type}'
        $newLines += '                        </span>'
        $newLines += '                        '
        $newLines += '                        {slot.conflicts.length > 0 && ('
        $newLines += '                          <div style={{'
        $newLines += '                            position: ''absolute'','
        $newLines += '                            bottom: ''0.5rem'','
        $newLines += '                            right: ''0.5rem'''
        $newLines += '                          }}>'
        $newLines += '                            <AlertTriangle size={16} style={{ color: ''#ef4444'' }} />'
        $newLines += '                          </div>'
        $newLines += '                        )}'
        $newLines += '                      </div>'
        $newLines += '                    );'
        $newLines += '                  });'
        $newLines += '                })}'
        $newLines += '              </div>'
        
        $skipUntilClosing = 2  # On doit sauter jusqu'à la fermeture de la section
        continue
    }
    
    # Compter les accolades pour savoir quand arrêter de sauter
    if ($inReplaceSection) {
        if ($line -match '^\s*\)\)\}$') {
            $skipUntilClosing--
            if ($skipUntilClosing -le 0) {
                $inReplaceSection = $false
                Write-Host "Fin de remplacement à la ligne $i" -ForegroundColor Yellow
            }
            continue
        }
        continue
    }
    
    $newLines += $line
}

# Écrire le nouveau fichier
$newLines | Set-Content $file -Encoding UTF8
Write-Host "Fichier modifié avec succès!" -ForegroundColor Green
Write-Host "Backup disponible: $file.bak2" -ForegroundColor Cyan
