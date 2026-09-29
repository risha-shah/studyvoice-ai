# StudyVoice — AI Voice Study Assistant

StudyVoice is a personal voice-first AI study assistant that lets students ask questions aloud, sends the transcript to an LLM-backed REST API, and reads the answer back in real time.

## Features
- Browser speech-to-text
- Text-to-speech answers
- Python/Flask REST API backend
- Optional LLM API integration
- Built-in mock mode with no API key required
- Health-check endpoint for deployment monitoring

## Tech stack
Python, Flask, JavaScript, REST APIs, Web Speech API, LLM APIs

## Architecture
Voice input → browser speech recognition → `/api/chat` → LLM service → JSON response → browser text-to-speech

## Run locally
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python app.py
```

Open `http://localhost:5000`.

## Resume bullet
Built a voice-first AI study assistant using Python, JavaScript and REST APIs, converting spoken questions into LLM responses and returning real-time voice answers.

## Future improvements
- Course-note retrieval
- Conversation memory
- Calendar/deadline integration
- Response-quality evaluation
- Docker deployment
