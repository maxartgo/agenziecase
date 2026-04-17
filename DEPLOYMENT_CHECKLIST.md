# AgenzieCase Deployment Checklist

This checklist ensures a smooth and safe deployment to production.

## Pre-Deployment Checklist

### 1. Code Quality
- [ ] All tests passing (84/84 tests)
- [ ] Code review completed
- [ ] No console.log or debug statements
- [ ] Error handling implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection

### 2. Environment Configuration
- [ ] `.env.production` file created
- [ ] All required environment variables set
- [ ] Strong passwords configured (min 12 chars)
- [ ] JWT_SECRET set (min 32 chars)
- [ ] API keys configured
- [ ] Database connection verified
- [ ] Redis connection verified

### 3. Security
- [ ] HTTPS/TLS certificates installed
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Password hashing (bcrypt)
- [ ] JWT expiration configured
- [ ] File upload restrictions
- [ ] Dependencies updated and scanned

### 4. Database
- [ ] Database backups enabled
- [ ] Migration scripts tested
- [ ] Indexes created
- [ ] Connection pooling configured
- [ ] Query optimization done
- [ ] Database user permissions set

### 5. Performance
- [ ] Redis caching enabled
- [ ] Compression enabled
- [ ] Static file caching configured
- [ ] CDN configured (if applicable)
- [ ] Load testing completed
- [ ] Slow queries identified and optimized
- [ ] Response times acceptable (< 500ms p95)

### 6. Monitoring & Logging
- [ ] Application logging configured
- [ ] Error tracking (Sentry, etc.)
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Database metrics
- [ ] Redis metrics
- [ ] Alert notifications configured

### 7. Docker Configuration
- [ ] Docker images built successfully
- [ ] docker-compose.yml verified
- [ ] Health checks passing
- [ ] Resource limits configured
- [ ] Volume persistence configured
- [ ] Network isolation configured

### 8. Backup & Recovery
- [ ] Automated database backups
- [ ] Backup retention policy
- [ ] Disaster recovery plan
- [ ] Restore procedures tested
- [ ] Backup encryption

## Deployment Steps

### Phase 1: Preparation
1. Run pre-deployment verification script:
   ```bash
   ./scripts/verify-deployment.sh
   ```

2. Create database backup:
   ```bash
   ./deploy.sh db:backup
   ```

3. Tag current release:
   ```bash
   git tag -a v1.0.0 -m "Production release"
   git push origin v1.0.0
   ```

### Phase 2: Deployment
1. Stop current services:
   ```bash
   ./deploy.sh down
   ```

2. Pull latest code:
   ```bash
   git pull origin main
   ```

3. Build new images:
   ```bash
   ./deploy.sh build
   ```

4. Start services:
   ```bash
   ./deploy.sh up
   ```

5. Run migrations:
   ```bash
   docker-compose exec backend npm run migrate
   ```

6. Seed initial data (if needed):
   ```bash
   docker-compose exec backend npm run seed
   ```

### Phase 3: Verification
1. Check service health:
   ```bash
   ./deploy.sh health
   ```

2. Check service status:
   ```bash
   ./deploy.sh status
   ```

3. View logs:
   ```bash
   ./deploy.sh logs
   ```

4. Test critical endpoints:
   - Frontend: http://localhost
   - Backend health: http://localhost:3456/api/health
   - API endpoints

### Phase 4: Post-Deployment
1. Monitor error logs:
   ```bash
   ./deploy.sh logs backend | grep ERROR
   ```

2. Check database performance:
   ```bash
   ./deploy.sh db:shell
   \timing on
   SELECT COUNT(*) FROM properties;
   ```

3. Verify Redis caching:
   ```bash
   ./deploy.sh redis:shell
   INFO stats
   ```

4. Run smoke tests:
   ```bash
   npm run test:integration
   ```

## Rollback Procedure

If deployment fails:

### Quick Rollback
1. Stop current deployment:
   ```bash
   ./deploy.sh down
   ```

2. Restore previous version:
   ```bash
   git checkout <previous-tag>
   ```

3. Rebuild and start:
   ```bash
   ./deploy.sh build
   ./deploy.sh up
   ```

### Database Rollback
1. Stop backend:
   ```bash
   docker-compose stop backend
   ```

2. Restore database backup:
   ```bash
   docker-compose exec -T database psql -U agenziecase agenziecase < backup.sql
   ```

3. Start backend:
   ```bash
   docker-compose start backend
   ```

## Monitoring Checklist

### First Hour
- [ ] Check error logs every 10 minutes
- [ ] Monitor response times
- [ ] Verify database connection pool
- [ ] Check Redis hit rate
- [ ] Monitor memory usage

### First Day
- [ ] Review error rates
- [ ] Check database query performance
- [ ] Verify backup completed
- [ ] Monitor uptime
- [ ] Review user feedback

### First Week
- [ ] Daily log review
- [ ] Performance metrics review
- [ ] Security scan results
- [ ] Backup verification
- [ ] Update documentation

## Maintenance Tasks

### Daily
- [ ] Check error logs
- [ ] Verify backups
- [ ] Monitor disk space
- [ ] Review resource usage

### Weekly
- [ ] Review slow queries
- [ ] Check dependency updates
- [ ] Test restore procedure
- [ ] Review access logs

### Monthly
- [ ] Security audit
- [ ] Performance review
- [ ] Dependency updates
- [ ] Disaster recovery test
- [ ] Capacity planning

## Emergency Contacts

- **DevOps Lead:** [Contact info]
- **Database Admin:** [Contact info]
- **Security Lead:** [Contact info]
- **Product Owner:** [Contact info]

## Useful Commands

### Check Resource Usage
```bash
docker stats
```

### View Real-time Logs
```bash
docker-compose logs -f backend
```

### Database Query Performance
```bash
docker-compose exec backend npm run performance:check
```

### Redis Statistics
```bash
docker-compose exec redis redis-cli -a <password> INFO stats
```

### Clear Redis Cache
```bash
docker-compose exec redis redis-cli -a <password> FLUSHDB
```

### Restart Specific Service
```bash
docker-compose restart backend
```

### Scale Backend
```bash
docker-compose up -d --scale backend=3
```

## Troubleshooting

### High Memory Usage
1. Check container stats: `docker stats`
2. Review logs for memory leaks
3. Restart affected services
4. Consider increasing resource limits

### Slow Database Queries
1. Enable slow query log
2. Run `EXPLAIN ANALYZE` on slow queries
3. Add missing indexes
4. Optimize queries

### High Error Rate
1. Check application logs
2. Verify database connectivity
3. Check Redis connection
4. Review recent changes

### Service Won't Start
1. Check logs: `docker-compose logs <service>`
2. Verify environment variables
3. Check resource availability
4. Verify port availability

## Success Criteria

Deployment is considered successful when:

- [ ] All services are running
- [ ] Health checks passing
- [ ] No errors in logs
- [ ] Response times acceptable
- [ ] Database queries performing well
- [ ] Redis caching working
- [ ] Backups completed
- [ ] Monitoring alerts configured
- [ ] No user-facing issues

---

**Last Updated:** 2026-04-10
**Version:** 1.0.0
