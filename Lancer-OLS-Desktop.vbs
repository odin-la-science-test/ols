Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Obtenir le chemin du dossier du script
scriptPath = fso.GetParentFolderName(WScript.ScriptFullName)

' Changer le répertoire de travail
WshShell.CurrentDirectory = scriptPath

' Lancer npm run electron:dev sans fenêtre visible
' 0 = fenêtre cachée, False = ne pas attendre la fin
WshShell.Run "cmd /c npm run electron:dev", 0, False

Set fso = Nothing
Set WshShell = Nothing
