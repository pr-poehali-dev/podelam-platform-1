import json
import os
import importlib
import sys
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="LigaChess API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sys.path.insert(0, os.path.dirname(__file__))

FUNCTION_MODULES = {
    "admin-auth": "functions.admin_auth",
    "admin-stats": "functions.admin_stats",
    "apply-daily-decay": "functions.apply_daily_decay",
    "chat": "functions.chat",
    "finish-game": "functions.finish_game",
    "friends": "functions.friends",
    "game-history": "functions.game_history",
    "geo-detect": "functions.geo_detect",
    "invite-game": "functions.invite_game",
    "matchmaking": "functions.matchmaking",
    "online-move": "functions.online_move",
    "rating-settings": "functions.rating_settings",
    "send-otp": "functions.send_otp",
    "site-settings": "functions.site_settings",
    "user-check": "functions.user_check",
    "verify-otp": "functions.verify_otp",
}

_loaded = {}
for name, module_path in FUNCTION_MODULES.items():
    try:
        _loaded[name] = importlib.import_module(module_path)
    except Exception as e:
        print(f"[WARN] Failed to load {name}: {e}")


class FakeContext:
    def __init__(self):
        self.request_id = "local"


async def _build_event(request: Request) -> dict:
    headers_dict = dict(request.headers)
    qs = dict(request.query_params)
    body_bytes = await request.body()
    body_str = body_bytes.decode("utf-8") if body_bytes else ""

    return {
        "httpMethod": request.method,
        "headers": headers_dict,
        "queryStringParameters": qs if qs else None,
        "body": body_str,
        "isBase64Encoded": False,
        "requestContext": {
            "identity": {
                "sourceIp": request.client.host if request.client else "unknown"
            }
        },
    }


def _make_response(result: dict) -> Response:
    status = result.get("statusCode", 200)
    resp_headers = result.get("headers", {})
    body = result.get("body", "")
    return Response(content=body, status_code=status, headers=resp_headers)


@app.api_route("/api/{func_name}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
@app.api_route("/api/{func_name}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
async def proxy(func_name: str, request: Request, path: str = ""):
    mod = _loaded.get(func_name)
    if not mod:
        return Response(
            content=json.dumps({"error": f"Function '{func_name}' not found"}),
            status_code=404,
            headers={"Content-Type": "application/json"},
        )

    event = await _build_event(request)
    ctx = FakeContext()

    try:
        result = mod.handler(event, ctx)
    except Exception as e:
        return Response(
            content=json.dumps({"error": str(e)}),
            status_code=500,
            headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
        )

    return _make_response(result)


@app.get("/health")
async def health():
    return {"status": "ok", "functions": list(_loaded.keys())}
