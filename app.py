import os, requests
from flask import Flask, jsonify, request, send_from_directory
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__, static_folder="static")

SYSTEM_PROMPT = "You are StudyVoice, a concise voice study assistant for university students."

def mock_reply(message):
    return f"Here is a concise study response: {message}. Break the idea into a definition, one example, and one practice question."

def llm_reply(message):
    api_url = os.getenv("LLM_API_URL")
    api_key = os.getenv("LLM_API_KEY")
    model = os.getenv("LLM_MODEL", "gpt-4o-mini")
    if not api_url or not api_key:
        return mock_reply(message)
    payload = {
        "model": model,
        "messages": [
            {"role":"system","content":SYSTEM_PROMPT},
            {"role":"user","content":message}
        ],
        "temperature": 0.3
    }
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type":"application/json"}
    r = requests.post(api_url, json=payload, headers=headers, timeout=30)
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]

@app.get("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.post("/api/chat")
def chat():
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error":"message is required"}), 400
    try:
        return jsonify({"reply":llm_reply(message)})
    except Exception as e:
        return jsonify({"error":str(e)}), 500

@app.get("/api/health")
def health():
    return jsonify({"status":"ok"})

if __name__ == "__main__":
    app.run(debug=True, port=int(os.getenv("PORT","5000")))
