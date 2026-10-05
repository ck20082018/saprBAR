MD "c:\SMiTM"
MD "c:\SMiTM\STUDENT"
MD "c:\SMiTM\EXE\"

MD  "c:\SMiTM\EXE\TEST-Win"

RD  "c:\SMiTM\EXE\TEST-Win\SM_TW_HELP" /S /Q

MD  "c:\SMiTM\EXE\TEST-Win\SM_TW_HELP"
DEL "c:\SMiTM\EXE\TEST-Win\*.exe" /F /Q
DEL "c:\SMiTM\EXE\TEST-Win\*.mss" /F /Q
DEL "c:\SMiTM\EXE\TEST-Win\*.ico" /F /Q

C:\windows\System32\xcopy.exe "FILES\*.exe" "c:\SMiTM\EXE\TEST-Win" /Y /S /I /R /K /A
C:\windows\System32\xcopy.exe "FILES\*.mss" "c:\SMiTM\EXE\TEST-Win" /Y /S /I /R /K /A
C:\windows\System32\xcopy.exe "FILES\*.ico" "c:\SMiTM\EXE\TEST-Win" /Y /S /I /R /K /A

Del /F /Q "%UserProfile%\Desktop\TEST-Win(C).lnk"
Del /F /Q "%UserProfile%\Рабочий стол\TEST-Win(C).lnk"
Del /F /Q c:\SMiTM\DESKTOP\TEST-Win(C).lnk

mkdir "c:\SMiTM\DESKTOP"
copy /Y "FILES\TEST-Win(C).lnk" "c:\SMiTM\DESKTOP"
copy /Y "FILES\TEST-Win(C).lnk" "%UserProfile%\Desktop\"
copy /Y "FILES\TEST-Win(C).lnk" "%UserProfile%\Рабочий стол\"

C:\windows\System32\xcopy.exe "FILES\SM_TW_HELP" "c:\SMiTM\EXE\TEST-Win\SM_TW_HELP" /Y /S /I /R /K /A

copy /Y "..\Send to Desktop(C).BAT"  "c:\SMiTM"
