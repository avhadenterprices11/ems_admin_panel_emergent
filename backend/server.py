import subprocess
import signal
import sys
import os
import threading
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.request import urlopen
from urllib.error import URLError

# Start Node.js backend as subprocess
node_process = None

def start_node_backend():
    global node_process
    node_process = subprocess.Popen(
        ['npx', 'ts-node-dev', '--respawn', '--transpile-only', 'src/server.ts'],
        cwd='/app/backend',
        stdout=sys.stdout,
        stderr=sys.stderr,
        env={**os.environ, 'PORT': '8001'}
    )
    return node_process

def cleanup(signum, frame):
    global node_process
    if node_process:
        node_process.terminate()
        node_process.wait()
    sys.exit(0)

signal.signal(signal.SIGTERM, cleanup)
signal.signal(signal.SIGINT, cleanup)

if __name__ == '__main__':
    print("Starting Node.js backend...")
    proc = start_node_backend()
    proc.wait()
