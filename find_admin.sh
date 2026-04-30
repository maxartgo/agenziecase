#!/bin/bash
echo "=== Struttura tabella users ==="
docker exec agenziecase-db psql -U agenziecase -d agenziecase -c "\d users"
echo ""
echo "=== Tutti gli utenti ==="
docker exec agenziecase-db psql -U agenziecase -d agenziecase -c "SELECT id, email, role, created_at FROM users ORDER BY created_at DESC;"
