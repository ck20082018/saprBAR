RD "C:\KIPR" /S /Q
RD "D:\KIPR" /S /Q

Del /F /Q "%UserProfile%\Desktop\KIPR-Win 1.0.lnk"
Del /F /Q "%UserProfile%\Рабочий стол\KIPR-Win 1.0.lnk"
Del /F /Q "%UserProfile%\Desktop\KIPR-IBM 4.01 DEMO.lnk"
Del /F /Q "%UserProfile%\Рабочий стол\KIPR-IBM 4.01 DEMO.lnk"

MD c:\SMiTM
MD c:\SMiTM\STUDENT
MD c:\SMiTM\EXE\

RD "c:\SMiTM\EXE\KIPR-Win 1.0" /S /Q
RD "c:\SMiTM\STUDENT\KIPR-Win 1.0\Examples" /S /Q

MD "c:\SMiTM\EXE\KIPR-Win 1.0"
MD "c:\SMiTM\STUDENT\KIPR-Win 1.0\Examples"

C:\windows\System32\xcopy.exe "FILES\APPLIC_FILES\*.*" "c:\SMiTM\EXE\KIPR-Win 1.0" /Y /S /I /R /K /A
C:\windows\System32\xcopy.exe "FILES\Examples"                  "c:\SMiTM\STUDENT\KIPR-Win 1.0\Examples" /Y /S /I /R /K /A

Del /F /Q "%UserProfile%\Desktop\KIPR-Win 1.0(C) Demo.lnk"
Del /F /Q "%UserProfile%\Рабочий стол\KIPR-Win 1.0(C) Demo.lnk"
Del /F /Q c:\SMiTM\DESKTOP\KIPR-Win 1.0(C) Demo.lnk

mkdir c:\SMiTM\DESKTOP
copy /Y "FILES\APPLIC_FILES\KIPR-Win 1.0(C) Demo.lnk" c:\SMiTM\DESKTOP
copy /Y "FILES\APPLIC_FILES\KIPR-Win 1.0(C) Demo.lnk" "%UserProfile%\Desktop\"
copy /Y "FILES\APPLIC_FILES\KIPR-Win 1.0(C) Demo.lnk" "%UserProfile%\Рабочий стол\"

copy /Y "..\Send to Desktop(C).BAT"  c:\SMiTM



