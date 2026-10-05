set dosbox=C:\SMiTM\EXE\DOSBox-0.74-2\DOSBox.exe
set curpath=%cd%

"%dosbox%" -conf "C:\SMiTM\EXE\DOSBox-0.74-2\dosbox.conf" -c "mount c c:\ " -c "c:" -c "cd %curpath%" -c "c:\SMiTM\EXE\SAPR_B30\FILES\sapr_b30.exe" -c "exit"


