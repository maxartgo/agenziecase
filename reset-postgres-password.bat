@echo off
echo ========================================
echo Reset Password PostgreSQL - AgenzieCase
echo ========================================
echo.
echo Questo script:
echo 1. Modifica pg_hba.conf per usare "trust"
echo 2. Riavvia PostgreSQL
echo 3. Resetta la password dell'utente postgres
echo 4. Ripristina pg_hba.conf
echo 5. Riavvia PostgreSQL
echo.
echo Richiede: ESECUZIONE COME AMMINISTRATORE
echo.
pause

set PGPASSWORD=66w0[R=x1b{u)7Wb|yN$.9{Kk1w(};0

echo.
echo [1/5] Modifica pg_hba.conf...
copy "C:\Program Files\PostgreSQL\18\data\pg_hba.conf" "C:\Program Files\PostgreSQL\18\data\pg_hba.conf.backup"

echo # TYPE  DATABASE  USER  ADDRESS  METHOD > "C:\Program Files\PostgreSQL\18\data\pg_hba.conf.new"
echo local   all       all                 trust >> "C:\Program Files\PostgreSQL\18\data\pg_hba.conf.new"
echo host    all       all   127.0.0.1/32  trust >> "C:\Program Files\PostgreSQL\18\data\pg_hba.conf.new"
echo host    all       all   ::1/128       trust >> "C:\Program Files\PostgreSQL\18\data\pg_hba.conf.new"

move /Y "C:\Program Files\PostgreSQL\18\data\pg_hba.conf.new" "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"

echo [2/5] Riavvio PostgreSQL...
net stop postgresql-x64-18
timeout /t 2 /nobreak > nul
net start postgresql-x64-18
timeout /t 3 /nobreak > nul

echo [3/5] Reset password postgres...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "ALTER USER postgres PASSWORD '%PGPASSWORD%';"

echo [4/5] Ripristina pg_hba.conf...
copy /Y "C:\Program Files\PostgreSQL\18\data\pg_hba.conf.backup" "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"

echo [5/5] Riavvio PostgreSQL finale...
net stop postgresql-x64-18
timeout /t 2 /nobreak > nul
net start postgresql-x64-18
timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo PASSWORD RESET COMPLETATO!
echo ========================================
echo Password impostata: %PGPASSWORD%
echo.
echo Test connessione...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "SELECT current_database(), current_user, version();"
echo.
pause
