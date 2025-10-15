#!/usr/bin/env python3
"""
Simple HTTP Server for Garissa County PMD
No dependencies required - uses Python's built-in server
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from threading import Timer

# Configuration
PORT = 8000
HOST = 'localhost'

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers to allow cross-origin requests
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def open_browser():
    """Open browser after a short delay"""
    webbrowser.open(f'http://{HOST}:{PORT}/working-index.html')

def main():
    print("🚀 Starting Garissa County PMD Server...")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('working-index.html'):
        print("❌ Error: working-index.html not found!")
        print("   Make sure you're running this script from the Dashboard directory")
        sys.exit(1)
    
    # Change to script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    try:
        with socketserver.TCPServer((HOST, PORT), CustomHTTPRequestHandler) as httpd:
            print(f"✅ Server started successfully!")
            print(f"🌐 Server running at: http://{HOST}:{PORT}")
            print(f"📱 Main application: http://{HOST}:{PORT}/working-index.html")
            print(f"📱 Original app: http://{HOST}:{PORT}/index.html")
            print("")
            print("🎯 Quick Access:")
            print(f"   • Working Version: http://{HOST}:{PORT}/working-index.html")
            print(f"   • Original Version: http://{HOST}:{PORT}/index.html")
            print("")
            print("🔐 Demo Credentials:")
            print("   • UPN: 123456789")
            print("   • Password: Admin.123!")
            print("   • Or click 'Enter Demo Mode'")
            print("")
            print("⏹️  Press Ctrl+C to stop the server")
            print("=" * 50)
            
            # Open browser after 2 seconds
            Timer(2.0, open_browser).start()
            
            # Start serving
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use!")
            print(f"   Try a different port or stop the existing server")
        else:
            print(f"❌ Error starting server: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
