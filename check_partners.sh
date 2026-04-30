#!/bin/bash
echo "=== Struttura tabella partners ==="
docker exec agenziecase-db psql -U agenziecase -d agenziecase -c "\d partners"
echo ""
echo "=== Dati partner ==="
docker exec agenziecase-db psql -U agenziecase -d agenziecase -c "SELECT * FROM partners;"
