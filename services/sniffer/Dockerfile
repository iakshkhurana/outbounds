FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV MODE=dry-run
ENV BATCH_MS=1000
ENV OUTBOUNDS_API_URL=http://api:4000/api/events
ENV OUTBOUNDS_HEARTBEAT_URL=http://api:4000/api/heartbeat
ENV OUTBOUNDS_TOKEN=dev-local-token

CMD ["python", "main.py"]
