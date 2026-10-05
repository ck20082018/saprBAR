MD "d:\SMiTM"
MD "d:\SMiTM\STUDENT"
MD "d:\SMiTM\EXE\"

MD  "d:\SMiTM\EXE\TEST-Win"

DEL "d:\SMiTM\EXE\TEST-Win\*.exe" /F /Q
DEL "d:\SMiTM\EXE\TEST-Win\*.mss" /F /Q
DEL "d:\SMiTM\EXE\TEST-Win\*.ico" /F /Q
RD  "d:\SMiTM\EXE\TEST-Win\SM_TW_HELP" /S /Q

MD  "d:\SMiTM\EXE\TEST-Win\SM_TW_HELP"

C:\windows\System32\xcopy.exe "FILES\*.exe" "d:\SMiTM\EXE\TEST-Win" /Y /S /I /R /K /A
C:\windows\System32\xcopy.exe "FILES\*.mss" "d:\SMiTM\EXE\TEST-Win" /Y /S /I /R /K /A
C:\windows\System32\xcopy.exe "FILES\*.ico" "d:\SMiTM\EXE\TEST-Win" /Y /S /I /R /K /A

Del /F /Q "%UserProfile%\Desktop\TEST-Win(D).lnk"
Del /F /Q "%UserProfile%\Рабочий стол\TEST-Win(D).lnk"
Del /F /Q c:\SMiTM\DESKTOP\TEST-Win(D).lnk

mkdir "d:\SMiTM\DESKTOP"
copy /Y "FILES\TEST-Win(D).lnk" "d:\SMiTM\DESKTOP"
copy /Y "FILES\TEST-Win(D).lnk" "%UserProfile%\Desktop\"
copy /Y "FILES\TEST-Win(D).lnk" "%UserProfile%\Рабочий стол\"

C:\windows\System32\xcopy.exe "FILES\SM_TW_HELP" "d:\SMiTM\EXE\TEST-Win\SM_TW_HELP" /Y /S /I /R /K /A

copy /Y "..\Send to Desktop(D).BAT"  "d:\SMiTM"