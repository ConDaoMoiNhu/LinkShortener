# Rollback Strategy

## Vercel Deployment Rollback

1. **Instant rollback**: Go to [Vercel Dashboard](https://vercel.com) → Project → Deployments
2. Click the "..." menu on a previous successful deployment → **Promote to Production**
3. This takes effect immediately (no rebuild needed)

## Database Migration Rollback

### Using Prisma

```bash
# List all migrations
npx prisma migrate status

# Rollback by marking a migration as rolled back
npx prisma migrate resolve --rolled-back <migration_name>

# Then manually undo schema changes if needed
# Always test migration rollbacks in staging first!
```

### Manual SQL Rollback

```sql
-- Drop newly added indexes (safe, non-destructive)
DROP INDEX IF EXISTS "Click_createdAt_idx";
DROP INDEX IF EXISTS "Link_createdAt_idx";
```

## KV Cache Invalidation

```bash
# Clear all cached slugs (if KV becomes inconsistent)
# Use Upstash Redis CLI or Dashboard to flush keys matching pattern "slug:*"

# Or programmatically via API:
curl -X POST "https://<KV_REST_API_URL>/flushdb" \
  -H "Authorization: Bearer <KV_REST_API_TOKEN>"
```

> ⚠️ **Warning**: Flushing KV means all redirects will fall through to Node.js server until cache warms up. Expect higher latency temporarily.

## Feature Flags (for gradual rollouts)

Use environment variables as simple feature flags:

```env
# .env.local
FEATURE_RATE_LIMITING=true
FEATURE_STRICT_AUTH=true
```

```typescript
// Usage in code
if (process.env.FEATURE_RATE_LIMITING === "true") {
  const rl = rateLimit(...);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
}
```

## Emergency Procedures

1. **Auth broken**: Set `FEATURE_STRICT_AUTH=false` → redeploy
2. **Rate limiting too aggressive**: Increase limits in route files → redeploy
3. **DB connection issues**: Check Supabase dashboard → verify connection pooling → restart
4. **KV unavailable**: Middleware falls through to Node.js SSR automatically (graceful degradation already built in)

## DB Backup/Restore

Supabase provides daily automatic backups on Pro plan. To manually backup:

```bash
# Export
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20260330.sql
```
