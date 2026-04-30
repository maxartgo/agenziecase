#!/bin/bash
docker exec agenziecase-db psql -U agenziecase -d agenziecase -c "UPDATE partners SET \"visuraCamerale\" = '/uploads/partners/Contratto uso auto-1777483960253-994189521.pdf', \"documentoIdentita\" = '/uploads/partners/CV024-1777483960254-934489794.pdf' WHERE id = 1;"
