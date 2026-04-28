#!/bin/bash

# Start both development servers and keep them running
# Usage: ./start-dev.sh

set +e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_SERVER_DIR="$ROOT_DIR/artifacts/api-server"
FRONTEND_DIR="$ROOT_DIR/artifacts/decants-shop"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Fanah Fragances Development Environment...${NC}"
echo -e "${GREEN}========================================${NC}"

# Kill any existing processes on ports 3000 and 5173
echo -e "${YELLOW}🧹 Cleaning up old processes...${NC}"
lsof -i :3000 -t | xargs -r kill -9 2>/dev/null || true
lsof -i :5173 -t | xargs -r kill -9 2>/dev/null || true
sleep 1

# Start API Server in background
echo -e "\n${BLUE}📦 Starting API Server (port 3000)...${NC}"
cd "$API_SERVER_DIR"
pnpm dev > "$ROOT_DIR/.api-server.log" 2>&1 &
API_PID=$!
echo "API Server PID: $API_PID"

# Wait for API server to be ready
API_READY=0
ATTEMPTS=0
while [ $API_READY -eq 0 ] && [ $ATTEMPTS -lt 30 ]; do
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        API_READY=1
        echo -e "${GREEN}✅ API Server is ready!${NC}"
    fi
    if [ $API_READY -eq 0 ]; then
        sleep 1
        ATTEMPTS=$((ATTEMPTS + 1))
    fi
done

if [ $API_READY -eq 0 ]; then
    echo -e "${YELLOW}⚠️  API Server might not be responding, but continuing...${NC}"
fi

# Start Frontend Server in background
echo -e "\n${BLUE}🎨 Starting Frontend Server (port 5173)...${NC}"
cd "$FRONTEND_DIR"
pnpm dev > "$ROOT_DIR/.frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "Frontend Server PID: $FRONTEND_PID"

# Wait for Frontend server to be ready
FRONTEND_READY=0
ATTEMPTS=0
while [ $FRONTEND_READY -eq 0 ] && [ $ATTEMPTS -lt 30 ]; do
    if curl -s http://localhost:5173/ > /dev/null 2>&1; then
        FRONTEND_READY=1
        echo -e "${GREEN}✅ Frontend Server is ready!${NC}"
    fi
    if [ $FRONTEND_READY -eq 0 ]; then
        sleep 1
        ATTEMPTS=$((ATTEMPTS + 1))
    fi
done

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Development Environment Ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${BLUE}📍 Access the application at:${NC}"
echo -e "   🏪 Frontend: http://localhost:5173"
echo -e "   🔐 Admin Panel: http://localhost:5173/admin/login"
echo -e "   ${YELLOW}🔑 Admin Password: Lujo14${NC}"
echo -e "   🛠️  API: http://localhost:3000"
echo -e "\n${BLUE}💡 Servers are running in background${NC}"
echo -e "   API logs: tail -f $ROOT_DIR/.api-server.log"
echo -e "   Frontend logs: tail -f $ROOT_DIR/.frontend.log"
echo -e "   ${YELLOW}Kill with: kill $API_PID $FRONTEND_PID${NC}"

# Monitor processes
while true; do
    sleep 5
    
    if ! ps -p $API_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  API Server crashed! Restarting...${NC}"
        cd "$API_SERVER_DIR"
        pnpm dev > "$ROOT_DIR/.api-server.log" 2>&1 &
        API_PID=$!
    fi
    
    if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Frontend Server crashed! Restarting...${NC}"
        cd "$FRONTEND_DIR"
        pnpm dev > "$ROOT_DIR/.frontend.log" 2>&1 &
        FRONTEND_PID=$!
    fi
done
