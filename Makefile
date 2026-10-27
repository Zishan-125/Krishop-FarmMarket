.PHONY: demo down test train uplift vision
demo:            ## web + ML service + seeded MongoDB
	docker compose up --build
down:
	docker compose down -v
test:            ## 15 Python tests on real data
	cd ml-service && python -m pytest tests
train:           ## re-run the model comparison (~4 min)
	cd ml-service && python -m farmmarket.train
uplift:          ## re-run the 2-year point-in-time replay (~3 min); run after `train`
	cd ml-service && python -m farmmarket.uplift
vision:          ## re-download a PlantVillage sample and retrain the photo classifier (~6 min)
	cd ml-service && python scripts/fetch_plantvillage.py --per-class 200 --out /tmp/pvdata && python scripts/train_vision_lite.py --data /tmp/pvdata
