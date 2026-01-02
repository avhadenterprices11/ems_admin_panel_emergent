"""
Python ASGI wrapper that starts Node.js backend and serves as a reverse proxy.
This is needed because the supervisor configuration expects uvicorn with Python.
"""
import subprocess
import signal
import sys
import os
import asyncio
import httpx
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse

# Initialize FastAPI app
app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Node.js backend port (we'll run it on 8002 internally)
NODE_BACKEND_URL = "http://127.0.0.1:8002"
node_process = None

@app.on_event("startup")
async def start_node_backend():
    """Start the Node.js backend on startup"""
    global node_process
    
    # Set environment for Node.js
    env = os.environ.copy()
    env["PORT"] = "8002"
    
    # Check if node_modules exists
    if not os.path.exists("/app/backend/node_modules"):
        print("Installing Node.js dependencies...")
        subprocess.run(["npm", "install"], cwd="/app/backend", env=env)
    
    # Start Node.js backend
    print("Starting Node.js backend on port 8002...")
    node_process = subprocess.Popen(
        ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/server.ts"],
        cwd="/app/backend",
        env=env,
        stdout=sys.stdout,
        stderr=sys.stderr
    )
    
    # Wait a bit for Node.js to start
    await asyncio.sleep(3)
    print("Node.js backend started")

@app.on_event("shutdown")
async def stop_node_backend():
    """Stop the Node.js backend on shutdown"""
    global node_process
    if node_process:
        print("Stopping Node.js backend...")
        node_process.terminate()
        try:
            node_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            node_process.kill()

async def proxy_request(request: Request, path: str = ""):
    """Proxy all requests to Node.js backend"""
    async with httpx.AsyncClient(timeout=60.0) as client:
        # Build target URL
        url = f"{NODE_BACKEND_URL}/api/{path}"
        if request.query_params:
            url += f"?{request.query_params}"
        
        # Get request body
        body = await request.body()
        
        # Forward the request
        try:
            response = await client.request(
                method=request.method,
                url=url,
                headers={k: v for k, v in request.headers.items() if k.lower() not in ['host', 'content-length']},
                content=body,
            )
            
            # Build response headers
            response_headers = dict(response.headers)
            response_headers.pop('transfer-encoding', None)
            response_headers.pop('content-encoding', None)
            
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=response_headers,
            )
        except httpx.ConnectError:
            return Response(
                content='{"error": "Node.js backend not available"}',
                status_code=503,
                media_type="application/json"
            )
        except Exception as e:
            return Response(
                content=f'{{"error": "{str(e)}"}}',
                status_code=500,
                media_type="application/json"
            )

# Health check endpoint
@app.get("/api")
async def health_check():
    return {"message": "Hello World", "proxy": True}

# Catch-all route for API endpoints
@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def catch_all(request: Request, path: str):
    return await proxy_request(request, path)
