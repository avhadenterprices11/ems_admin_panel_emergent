"""
Minimal Python wrapper to satisfy uvicorn requirement.
This starts Node.js backend and proxies requests to it.
"""
import os
import sys
import subprocess
import asyncio
import signal
import httpx
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NODE_URL = "http://127.0.0.1:8002"
node_process = None

def start_node():
    global node_process
    env = os.environ.copy()
    env["PORT"] = "8002"
    node_process = subprocess.Popen(
        ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/server.ts"],
        cwd="/app/backend",
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )
    # Start log reader thread
    import threading
    def log_reader():
        for line in iter(node_process.stdout.readline, b''):
            print(line.decode(), end='', flush=True)
    threading.Thread(target=log_reader, daemon=True).start()

@app.on_event("startup")
async def startup():
    start_node()
    await asyncio.sleep(2)

@app.on_event("shutdown") 
async def shutdown():
    if node_process:
        node_process.terminate()

@app.api_route("/api/{path:path}", methods=["GET","POST","PUT","DELETE","PATCH","OPTIONS"])
async def proxy(request: Request, path: str):
    async with httpx.AsyncClient(timeout=120.0) as client:
        url = f"{NODE_URL}/api/{path}"
        if request.query_params:
            url += f"?{request.query_params}"
        body = await request.body()
        headers = {k:v for k,v in request.headers.items() if k.lower() not in ['host','content-length']}
        try:
            resp = await client.request(request.method, url, headers=headers, content=body)
            return Response(content=resp.content, status_code=resp.status_code, 
                          headers={k:v for k,v in resp.headers.items() if k.lower() not in ['transfer-encoding','content-encoding']})
        except Exception as e:
            return Response(content=f'{{"error":"{str(e)}"}}', status_code=503, media_type="application/json")

@app.get("/api")
async def health():
    return {"status": "ok"}
