#!/bin/bash

# Double-click this file to start local server
# Works on Mac - no installation needed!

cd "$(dirname "$0")"

echo "🚀 Starting Garissa County PMD Local Server..."
echo ""
echo "✓ Server starting on http://localhost:8000"
echo "✓ Opening in your default browser..."
echo ""
echo "Default Login:"
echo "  UPN: 123456789"
echo "  Password: Admin.123!"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Open browser after 2 seconds
(sleep 2 && open http://localhost:8000) &

# Start Python server
python3 -m http.server 8000

