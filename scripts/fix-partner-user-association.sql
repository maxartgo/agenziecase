-- SQL Script per correggere l'associazione user-partner
--
-- Questo script corregge tutti gli utenti che hanno ruolo 'partner'
-- ma non hanno il partnerId impostato correttamente.
--
-- Uso sul server:
-- docker exec -i agenziecase-db psql -U agenziecase -d agenziecase < scripts/fix-partner-user-association.sql

-- Aggiorna tutti gli utenti partner con il partnerId corretto
UPDATE users
SET "partnerId" = partners.id
FROM partners
WHERE users.role = 'partner'
  AND partners."userId" = users.id
  AND (users."partnerId" IS NULL OR users."partnerId" != partners.id);

-- Mostra i risultati
SELECT
    users.id as user_id,
    users.email,
    users.role,
    users."partnerId",
    partners.id as partner_id,
    partners."companyName"
FROM users
LEFT JOIN partners ON partners."userId" = users.id
WHERE users.role = 'partner'
ORDER BY users.id;
