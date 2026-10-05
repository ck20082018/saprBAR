RD "C:\KIPR" /S /Q
RD "D:\KIPR"  /S /Q

Del /F /Q "%UserProfile%\Desktop\KIPR-Win 1.0.lnk"
Del /F /Q "%UserProfile%\Рабочий стол\KIPR-Win 1.0.lnk"
Del /F /Q "%UserProfile%\Desktop\KIPR-IBM 4.01 DEMO.lnk"
Del /F /Q "%UserProfile%\Рабочий стол\KIPR-IBM 4.01 DEMO.lnk"

MD d:\SMiTM
MD d:\SMiTM\STUDENT
MD d:\SMiTM\EXE\

RD "d:\SMiTM\EXE\KIPR-Win 1.0" /S /Q
RD "d:\SMiTM\STUDENT\KIPR-Win 1.0\Examples" /S /Q

MD "d:\SMiTM\EXE\KIPR-Win 1.0"
MD "d:\SMiTM\STUDENT\KIPR-Win 1.0\Examples"

C:\windows\System32\xcopy.exe "FILES\APPLIC_FILES\*.*" "d:\SMiTM\EXE\KIPR-Win 1.0" /Y /S /I /R /K /A
C:\windows\System32\xcopy.exe "FILES\Examples"         "d:\SMiTM\STUDENT\KIPR-Win 1.0\Examples" /Y /S /I /R /K /A

Del /F /Q "%UserProfile%\Desktop\KIPR-Win 1.0(D) Demo.lnk"
Del /F /Q "%UserProfile%\Рабочий стол\KIPR-Win 1.0(D) Demo.lnk"
Del /F /Q c:\SMiTM\DESKTOP\KIPR-Win 1.0(D) Demo.lnk

mkdir d:\SMiTM\DESKTOP
copy /Y "FILES\APPLIC_FILES\KIPR-Win 1.0(D) Demo.lnk" d:\SMiTM\DESKTOP
copy /Y "FILES\APPLIC_FILES\KIPR-Win 1.0(D) Demo.lnk" "%UserProfile%\Desktop\"
copy /Y "FILES\APPLIC_FILES\KIPR-Win 1.0(D) Demo.lnk" "%UserProfile%\Рабочий стол\"

copy /Y "..\Send to Desktop(D).BAT" d:\SMiTM


