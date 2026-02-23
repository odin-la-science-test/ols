@echo off
title Odin La Science - Lancement (MODE DEBUG)
cd /d "%~dp0"
echo.
echo ================================================
echo    Odin La Science - Application Desktop
echo ================================================
echo.
echo ATTENTION: Ce fichier affiche une fenetre CMD
echo Pour un lancement propre, utilisez: Lancer-OLS.vbs
echo.
echo Demarrage de l'application...
echo.
call npm run electron:dev
pause
