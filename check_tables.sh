#!/bin/bash
docker exec agenziecase-db psql -U agenziecase -d agenziecase -c "\dt" | grep -E "clients|appointments|deals|activities"
