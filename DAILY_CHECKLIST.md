# ✅ Daily Checklist - AgenzieCase

**Ultimo aggiornamento**: 2026-03-12
**Obiettivo**: Guida giornaliera per mantenere il progetto su track

---

## 🌅 Every Morning (5-10 min)

### Quick Health Check
```bash
# Check server status
curl http://localhost:3001/api/health

# Check database connection
psql -U postgres -d agenziecase -c "SELECT COUNT(*) FROM properties;"

# Check Redis (if configured)
redis-cli ping
```

### Pull Latest Changes
```bash
git pull origin main
npm install  # if package.json changed
```

### Review Today's Focus
- Check **ROADMAP.md** - Cosa devo completare oggi?
- Check current task in **TESTING.md** / **SECURITY.md** / etc.
- Set 3 main goals for the day

---

## 📋 Before Committing (2 min)

### Pre-Commit Checklist
- [ ] Codice formattato (`npm run format`)
- [ ] Nessun errore ESLint (`npm run lint`)
- [ ] Nessun console.log lasciato
- [ ] Test passano (`npm run test`)
- [ ] Commit message chiaro e descrittivo

### Commit Message Format
```
type(scope): description

# Examples:
feat(auth): add password validation
fix(api): resolve N+1 query in properties endpoint
test(user): add unit tests for User model
security: implement rate limiting on auth endpoints
docs: update SECURITY.md with new measures
```

---

## 🌙 End of Day (5 min)

### Update Progress
- [ ] Aggiorna checklist nei documenti (.md)
- [ ] Aggiorna percentuale progresso in ROADMAP.md
- [ ] Annota problemi bloccanti
- [ ] Push changes se stabili

### Daily Standup Note
```markdown
## [DATA] - Daily Progress

### ✅ Completed
- [ ] Task 1
- [ ] Task 2

### 🚧 In Progress
- [ ] Task 3 (50% complete)

### 🐛 Blockers
- Issue: description
- Solution: plan to fix

### 📝 Tomorrow's Plan
1. Task 4
2. Task 5
```

---

## 📊 Weekly Review (30 min - Friday)

### Review Checklist

#### Code Quality
- [ ] Zero ESLint errors
- [ ] Zero console.log in codebase
- [ ] No obvious code smells
- [ ] Documentation updated

#### Testing
- [ ] Test coverage increased
- [ ] All tests passing
- [ ] New tests added for new features

#### Security
- [ ] No new vulnerabilities
- [ ] Dependencies updated
- [ ] Security logs reviewed

#### Performance
- [ ] No performance regressions
- [ ] Database queries optimized
- [ ] Cache hit rate good

#### Documentation
- [ ] ROADMAP.md updated
- [ ] Daily notes reviewed
- [ ] Blockers addressed

---

## 🚨 Emergency Procedures

### Something Broke? Follow This:

1. **Don't Panic** 😌
2. **Check Logs**
   ```bash
   # Backend logs
   tail -f server/logs/combined.log

   # PM2 logs (if using PM2)
   pm2 logs

   # Docker logs (if using Docker)
   docker-compose logs -f
   ```

3. **Quick Rollback**
   ```bash
   git revert HEAD
   npm run build
   pm2 restart all
   ```

4. **Assess Impact**
   - Is database affected?
   - Are users affected?
   - Is data loss possible?

5. **Fix & Test**
   - Create fix branch
   - Write test first
   - Implement fix
   - Test thoroughly

6. **Deploy Fix**
   - Merge to main
   - Deploy
   - Monitor logs

---

## 📱 Quick Commands Reference

### Development
```bash
# Start dev servers
npm run dev          # Frontend (Vite)
cd server && npm run dev  # Backend

# Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
npm run test:unit        # Unit tests only
npm run test:e2e         # E2E tests
```

### Code Quality
```bash
npm run lint           # Check linting
npm run lint:fix       # Fix auto-fixable issues
npm run format         # Prettier format
```

### Database
```bash
cd server
npm run db:migrate     # Run migrations
npm run db:seed        # Seed database
npm run db:reset       # Reset & reseed
```

### Git
```bash
git status             # Check status
git add .              # Stage all
git commit -m "msg"    # Commit
git push               # Push
```

---

## 🎯 Focus Areas by Day

### Monday - Planning & Setup
- Review weekly goals
- Update ROADMAP.md
- Setup dev environment
- Review blockers

### Tuesday - Testing Focus
- Write unit tests
- Increase coverage
- Fix failing tests
- Review test strategy

### Wednesday - Security Focus
- Review security measures
- Fix vulnerabilities
- Update SECURITY.md
- Security testing

### Thursday - Performance Focus
- Optimize queries
- Review caching
- Performance testing
- Update PERFORMANCE.md

### Friday - Code Quality & Review
- Code review
- Refactoring
- Documentation
- Weekly review

---

## 📝 Notes

### Blocker Template
```markdown
## Blocker - [Date]

**Issue**: [Description]

**Impact**: [High/Medium/Low]

**Current Workaround**: [If any]

**Plan to Fix**:
1. Step 1
2. Step 2

**ETA**: [When it will be fixed]

**Status**: [Investigating/In Progress/Resolved]
```

### Quick Decision Log
```markdown
## Decision - [Date]

**Context**: [What we were trying to solve]

**Decision**: [What we decided]

**Rationale**: [Why we chose this]

**Alternatives Considered**: [Other options]

**Impact**: [What this affects]
```

---

## 🔗 Quick Links

- [ROADMAP.md](./ROADMAP.md) - Overall progress
- [TESTING.md](./TESTING.md) - Testing strategy
- [SECURITY.md](./SECURITY.md) - Security measures
- [PERFORMANCE.md](./PERFORMANCE.md) - Performance optimizations
- [CODE_QUALITY.md](./CODE_QUALITY.md) - Code standards
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide

---

**💡 Tip**: Print this or keep it open in a tab. Check it every morning and evening!
