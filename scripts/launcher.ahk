#NoEnv  ; Recommended for performance and compatibility
#NoTrayIcon
SetBatchLines -1 ; Recommended for performance
ListLines Off ; Recommended for performance
SetWorkingDir %A_ScriptDir% ; Ensures a consistent starting directory.

Run, % "electron.exe " . """" . A_WorkingDir . """", % A_WorkingDir . "\node_modules\electron\dist"