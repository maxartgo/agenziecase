SELECT id, email, role, "firstName", "lastName", "createdAt" FROM users WHERE role='admin' OR role='superadmin' ORDER BY "createdAt" DESC;
