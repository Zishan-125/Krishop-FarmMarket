# KriShop ML service

This FastAPI service is an optional boundary for forecasting and image grading. The checked-in implementation is deliberately an offline baseline: it returns deterministic seasonal estimates and an explicit unavailable state for image inference. It does not claim trained accuracy.

## Run locally

```bash
cd ml-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Set `ML_SERVICE_URL=http://localhost:8000` in the Next.js `.env.local`.

## Production training path

1. Download and license historical observations from FAOSTAT, World Bank, CGIAR, or a permitted local market source.
2. Store cleaned CSVs under `ml-service/data/` with `date`, `crop`, `hub`, `price`, and `unit`.
3. Split chronologically, not randomly.
4. Train one Prophet model per crop and hub, compare against a seasonal-naive baseline, and persist MAPE/MAE/RMSE.
5. Replace the fallback in `main.py` only after validating uncertainty intervals and source metadata.
6. For grading, use PlantVillage only for disease labels and a separate licensed ripeness/grade dataset. It does not automatically provide market-grade labels.
