set dosbox=D:\SMiTM\EXE\DOSBox-0.74-2\DOSBox.exe
set curpath=%cd%

"%dosbox%" -conf "D:\SMiTM\EXE\DOSBox-0.74-2\dosbox.conf" -c "mount d d:\ " -c "d:" -c "cd %curpath%" -c "d:\SMiTM\EXE\SAPR_B30\FILES\sapr_b30.exe" -c "exit"


