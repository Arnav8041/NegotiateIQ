"""
NegotiateIQ Backend

A FastAPI server with one WebSocket endpoint.
Starting point — Gemini integration and coaching logic
will be added step by step with Claude Code.
"""

import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="NegotiateIQ")

# Let the frontend talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"status": "ok", "service": "NegotiateIQ"}


@app.get("/health")
async def health():
    return {"healthy": True}


@app.websocket("/ws/session")
async def session(websocket: WebSocket):
    """
    Main WebSocket endpoint.
    Currently just echoes a test card back.
    """
    await websocket.accept()
    print("Client connected")

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            print(f"Received: {message}")

            # Test card — proves the connection works
            await websocket.send_json({
                "type": "coaching_card",
                "card": {
                    "card_type": "suggestion",
                    "message": "Connection working! This is a test card.",
                    "urgency": "low",
                },
            })

    except WebSocketDisconnect:
        print("Client disconnected")
