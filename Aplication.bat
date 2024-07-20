@echo off
setlocal

rem Sprawdź, czy Git Bash jest zainstalowany
set "gitBashPath=C:\Program Files\Git\bin\bash.exe"
set "gitBashPath64=C:\Program Files (x86)\Git\bin\bash.exe"

rem Sprawdź, czy PowerShell jest zainstalowany
set "powershellPath=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"

rem Sprawdź, czy Git Bash jest zainstalowany, jeśli tak, uruchom go
if exist "%gitBashPath%" (
    echo Uruchamianie Git Bash...
    start "" "%gitBashPath%"
    goto :eof
) else if exist "%gitBashPath64%" (
    echo Uruchamianie Git Bash...
    start "" "%gitBashPath64%"
    goto :eof
) else if exist "%powershellPath%" (
    echo Uruchamianie PowerShell...
    start "" "%powershellPath%"
    goto :eof
) else (
    echo Git Bash i PowerShell nie są zainstalowane. Uruchamianie CMD...
    start "" "%SystemRoot%\System32\cmd.exe"
)

endlocal
