RD c:\SMiTM\EXE\b_221 /Q /S
RD c:\SMiTM\STUDENT\bar_2_21 /Q /S
RD c:\SMiTM\EXE\SAPR_B30 /Q /S
RD c:\SMiTM\STUDENT\SAPR_B30 /Q /S

MD c:\SMiTM
MD c:\SMiTM\STUDENT
MD c:\SMiTM\STUDENT\SAPR_B30
MD c:\SMiTM\STUDENT\SAPR_B30\Ivanov_1
MD c:\SMiTM\STUDENT\SAPR_B30\Ivanov_2
MD c:\SMiTM\EXE
MD c:\SMiTM\EXE\SAPR_B30
MD c:\SMiTM\EXE\SAPR_B30\FILES
MD c:\SMiTM\EXE\DOSBox-0.74-2
echo WAIT, PLEASE ...

C:\windows\System32\xcopy.exe "DOSBox-0.74-2" "c:\SMiTM\EXE\DOSBox-0.74-2" /Y /S /I /R /K /A

set dosbox=c:\SMiTM\EXE\DOSBox-0.74-2\DOSBox.exe
set curpath=%cd%

copy /Y "%curpath%\FILES\*.*" c:\SMiTM\EXE\SAPR_B30\FILES\*.*
copy /Y "%curpath%\*.bat"     c:\SMiTM\EXE\SAPR_B30

copy /Y "%curpath%\FILES\SAPR-BAR-30(C).lnk" c:\SMiTM\DESKTOP

copy /Y "%curpath%\FILES\SAPR-BAR-30(C).bat" c:\SMiTM\STUDENT\SAPR_B30\Ivanov_1
copy /Y "%curpath%\FILES\SAPR-BAR-30(C).bat" c:\SMiTM\STUDENT\SAPR_B30\Ivanov_2

Del /F /Q "%UserProfile%\Desktop\SAPR-BAR(C).lnk"
Del /F /Q "%UserProfile%\Рабочий стол\SAPR-BAR(C).lnk"
Del /F /Q c:\SMiTM\DESKTOP\SAPR-BAR(C).lnk

Del /F /Q "%UserProfile%\Desktop\SAPR-BAR-30(C).lnk"
Del /F /Q "%UserProfile%\Рабочий стол\SAPR-BAR-30(C).lnk"
Del /F /Q c:\SMiTM\DESKTOP\SAPR-BAR-30(C).lnk

mkdir c:\SMiTM\DESKTOP
copy /Y "%curpath%\FILES\SAPR-BAR-30(C).lnk" c:\SMiTM\DESKTOP
copy /Y "%curpath%\FILES\SAPR-BAR-30(C).lnk" "%UserProfile%\Рабочий стол\"
copy /Y "%curpath%\FILES\SAPR-BAR-30(C).lnk" "%UserProfile%\Desktop\"

copy /Y "..\Send_to_Desktop_SAPR-BAR-30(C).BAT"  c:\SMiTM
