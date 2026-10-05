RD d:\SMiTM\EXE\b_221 /Q /S
RD d:\SMiTM\STUDENT\bar_2_21 /Q /S
RD d:\SMiTM\EXE\SAPR_B30 /Q /S
RD d:\SMiTM\STUDENT\SAPR_B30 /Q /S

MD d:\SMiTM
MD d:\SMiTM\STUDENT
MD d:\SMiTM\STUDENT\SAPR_B30
MD d:\SMiTM\STUDENT\SAPR_B30\Ivanov_1
MD d:\SMiTM\STUDENT\SAPR_B30\Ivanov_2
MD d:\SMiTM\EXE
MD d:\SMiTM\EXE\SAPR_B30
MD d:\SMiTM\EXE\SAPR_B30\FILES
MD d:\SMiTM\EXE\DOSBox-0.74-2
echo WAIT, PLEASE ...

C:\windows\System32\xcopy.exe "DOSBox-0.74-2" "d:\SMiTM\EXE\DOSBox-0.74-2" /Y /S /I /R /K /A

set dosbox=d:\SMiTM\EXE\DOSBox-0.74-2\DOSBox.exe
set curpath=%cd%

copy /Y "%curpath%\FILES\*.*" d:\SMiTM\EXE\SAPR_B30\FILES\*.*
copy /Y "%curpath%\*.bat"     d:\SMiTM\EXE\SAPR_B30

copy /Y "%curpath%\FILES\SAPR-BAR-30(D).lnk" d:\SMiTM\DESKTOP

copy /Y "%curpath%\FILES\SAPR-BAR-30(D).bat" d:\SMiTM\STUDENT\SAPR_B30\Ivanov_1
copy /Y "%curpath%\FILES\SAPR-BAR-30(D).bat" d:\SMiTM\STUDENT\SAPR_B30\Ivanov_2

Del /F /Q "%UserProfile%\Desktop\SAPR-BAR(D).lnk"
Del /F /Q "%UserProfile%\Рабочий стол\SAPR-BAR(D).lnk"
Del /F /Q d:\SMiTM\DESKTOP\SAPR-BAR(D).lnk

Del /F /Q "%UserProfile%\Desktop\SAPR-BAR-30(D).lnk"
Del /F /Q "%UserProfile%\Рабочий стол\SAPR-BAR-30(D).lnk"
Del /F /Q d:\SMiTM\DESKTOP\SAPR-BAR-30(D).lnk

mkdir d:\SMiTM\DESKTOP
copy /Y "%curpath%\FILES\SAPR-BAR-30(D).lnk" d:\SMiTM\DESKTOP
copy /Y "%curpath%\FILES\SAPR-BAR-30(D).lnk" "%UserProfile%\Рабочий стол\"
copy /Y "%curpath%\FILES\SAPR-BAR-30(D).lnk" "%UserProfile%\Desktop\"

copy /Y "..\Send_to_Desktop_SAPR-BAR-30(D).BAT"  d:\SMiTM

