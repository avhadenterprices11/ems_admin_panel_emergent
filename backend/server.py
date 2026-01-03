import subprocess
import signal
import sys
import os
import asyncio
import httpx

# Global reference to Node.js process
node_process = None

def start_node_backend():
    global node_process
    if node_process is None or node_process.poll() is not None:
        node_process = subprocess.Popen(
            ['npx', 'ts-node-dev', '--respawn', '--transpile-only', 'src/server.ts'],
            cwd='/app/backend',
            stdout=sys.stdout,
            stderr=sys.stderr,
            env={**os.environ, 'PORT': '8002'}  # Node runs on 8002, Python proxies from 8001
        )
    return node_process

# Start Node.js on import
start_node_backend()

async def proxy_request(scope, receive, send):
    """Proxy HTTP requests to Node.js backend"""
    if scope['type'] != 'http':
        return
    
    # Reconstruct the full URL
    path = scope.get('path', '/')
    query_string = scope.get('query_string', b'').decode('utf-8')
    if query_string:
        url = f"http://127.0.0.1:8002{path}?{query_string}"
    else:
        url = f"http://127.0.0.1:8002{path}"
    
    method = scope['method']
    headers = {k.decode(): v.decode() for k, v in scope['headers'] if k.decode().lower() not in ['host', 'content-length']}
    
    # Read request body
    body = b''
    while True:
        message = await receive()
        body += message.get('body', b'')
        if not message.get('more_body', False):
            break
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.request(
                method=method,
                url=url,
                headers=headers,
                content=body if body else None,
            )
            
            # Send response
            await send({
                'type': 'http.response.start',
                'status': response.status_code,
                'headers': [(k.encode(), v.encode()) for k, v in response.headers.items() if k.lower() not in ['content-encoding', 'transfer-encoding', 'content-length']],
            })
            await send({
                'type': 'http.response.body',
                'body': response.content,
            })
        except Exception as e:
            print(f"Proxy error: {e}")
            await send({
                'type': 'http.response.start',
                'status': 502,
                'headers': [(b'content-type', b'application/json')],
            })
            await send({
                'type': 'http.response.body',
                'body': b'{"error": "Backend unavailable"}',
            })

async def app(scope, receive, send):
    """ASGI application that proxies to Node.js backend"""
    if scope['type'] == 'lifespan':
        while True:
            message = await receive()
            if message['type'] == 'lifespan.startup':
                await send({'type': 'lifespan.startup.complete'})
            elif message['type'] == 'lifespan.shutdown':
                global node_process
                if node_process:
                    node_process.terminate()
                    node_process.wait()
                await send({'type': 'lifespan.shutdown.complete'})
                return
    else:
        await proxy_request(scope, receive, send)

def cleanup(signum, frame):
    global node_process
    if node_process:
        node_process.terminate()
        node_process.wait()
    sys.exit(0)

signal.signal(signal.SIGTERM, cleanup)
signal.signal(signal.SIGINT, cleanup)

