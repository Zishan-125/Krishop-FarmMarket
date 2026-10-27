# FastAPI ML service. Build context is the repo root (needs ../requirements.txt).
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY ml-service/ ./
ENV TWIN_DB=/app/data/twin.sqlite PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["sh", "-c", "python scripts/seed_twin.py && uvicorn farmmarket.api:app --host 0.0.0.0 --port 8000"]
