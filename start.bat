@echo off
title Starting Next.js Server
echo Starting the Next.js server...
start cmd /k "npm run dev"
timeout /t 5
start http://localhost:3000/dashboard
exit