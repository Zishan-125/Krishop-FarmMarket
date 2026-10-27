# Your own field photos

Put real photos taken with a phone in the field here, one sub-folder per PlantVillage class, using the exact class names
from `data/disease_catalog.json` (for example `Tomato___Late_blight/`, `Tomato___healthy/`, `Potato___healthy/`, `Pepper,_bell___healthy/`).
Use JPG/PNG, any size. Aim for at least 20 photos per class you can actually photograph, taken on the plant or on the farm table
(not on a plain lab background), in different light.

Two separate uses, so the reported number stays honest:
1. **Evaluate** (report this number): put photos the model has never seen in `data/field_photos_test/` (same folder layout) and run
   `python scripts/eval_field_photos.py --dir data/field_photos_test`. It writes `models/field_photo_report.json` and the UI/README can quote it.
2. **Train** with some of them: keep different photos here and run
   `python scripts/train_vision_lite.py --data /tmp/pvdata --extra data/field_photos`.
   Then re-run the evaluation on the untouched `field_photos_test/` photos. Never evaluate on photos that were used for training.
