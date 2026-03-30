FROM python:3.13-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update \
	&& apt-get install -y --no-install-recommends libatomic1 \
	&& rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8200

CMD ["sh", "-c", "prisma generate && prisma db push --accept-data-loss && uvicorn main:app --host 0.0.0.0 --port 8200"]
