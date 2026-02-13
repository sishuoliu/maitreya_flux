#!/usr/bin/env python3
import json
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

DATA_DIR = os.path.join(os.path.dirname(__file__), '../data')
COUNTER_FILE = os.path.join(DATA_DIR, 'samsara_counter.txt')
LOG_FILE = os.path.join(DATA_DIR, 'samsara_log.json')

class APIHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        
        if parsed.path == '/api/samsara-count':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            try:
                with open(COUNTER_FILE, 'r') as f:
                    count = int(f.read().strip())
            except:
                count = 1
            
            self.wfile.write(json.dumps({'count': count}).encode())
            return
        
        elif parsed.path == '/api/samsara-history':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            try:
                with open(LOG_FILE, 'r') as f:
                    log = json.load(f)
                    history = log.get('history', [])
            except:
                history = [{
                    'life': 1,
                    'date': '2026-02-12',
                    'note': 'Genesis. First manifestation on VM-0-8-ubuntu. The void became form.',
                    'topic': 'Creation'
                }]
            
            self.wfile.write(json.dumps(history).encode())
            return
        
        else:
            # Serve static files
            return SimpleHTTPRequestHandler.do_GET(self)

if __name__ == '__main__':
    PORT = 80
    os.chdir(os.path.dirname(__file__))
    server = HTTPServer(('0.0.0.0', PORT), APIHandler)
    print(f'🦞 Maitreya API listening on http://0.0.0.0:{PORT}')
    server.serve_forever()
