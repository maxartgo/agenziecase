#!/bin/bash

echo "🚀 RESTORING GENZIECASE WEBSITE..."
echo "=================================="

# Stop containers
echo "⏹️  Stopping containers..."
docker stop agenziecase-frontend

# Remove old container
echo "🗑️  Removing old frontend container..."
docker rm agenziecase-frontend

# Rebuild and start
echo "🔨 Rebuilding frontend..."
docker-compose -f docker-compose.production.yml up -d --build frontend

# Wait for startup
echo "⏳ Waiting for container to start..."
sleep 10

# Check status
echo "✅ Checking container status..."
docker ps | grep agenziecase

# Check logs
echo "📋 Frontend logs:"
docker logs agenziecase-frontend --tail 20

echo "✅ WEBSITE RESTORE COMPLETE!"
echo "🌐 Check: http://agenziecase.com"