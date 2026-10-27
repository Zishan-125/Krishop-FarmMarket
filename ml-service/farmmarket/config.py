"""Central configuration. Prices come from data/market_ml_dataset_final.csv (AgriPriceBD,
national daily BDT/kg, retail + wholesale, 2020-07 to 2025-06). The dataset has NO market
location, so prices are national; hubs are used only for freight distance."""
import os

# internal key -> (name in dataset, display name)
CROP_MAP = {
    "chickpea": ("Chickpea", "Chickpea (Chola)"),
    "cucumber": ("Cucumber", "Cucumber"),
    "garlic": ("Garlic Local", "Garlic (local)"),
    "green_chilli": ("Green Chilli", "Green chilli"),
    "sweet_pumpkin": ("Sweet Pumpkin", "Sweet pumpkin"),
}
CROPS = list(CROP_MAP)
PRICE_TYPES = ["wholesale", "retail"]

# Logistics-only hub coordinates (dataset has no market locations).
HUBS = {
    "Dhaka": (23.8103, 90.4125), "Chattogram": (22.3569, 91.7832), "Rajshahi": (24.3745, 88.6042),
    "Khulna": (22.8456, 89.5403), "Sylhet": (24.8949, 91.8687),
}

# ASSUMPTIONS (not in the dataset): shelf life in days at ambient temperature.
SHELF_LIFE_DAYS = {"chickpea": 365, "cucumber": 9, "garlic": 150, "green_chilli": 7, "sweet_pumpkin": 90}

COST_PER_KM_PER_KG = 0.012   # BDT per km per kg (assumption)
CO2_KG_PER_KM = 0.62         # light truck, loaded
AVG_SPEED_KMH = 38.0
FARM_GATE_DISCOUNT = 0.0     # wholesale is used as farm-gate proxy; set e.g. 0.05 if you know your collection margin

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")   # must match a model ID shown in Google AI Studio
BASE_DIR = os.path.join(os.path.dirname(__file__), "..")
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_DIR = os.path.join(BASE_DIR, "models")
PRICE_CSV = os.getenv("PRICE_CSV", os.path.join(DATA_DIR, "market_ml_dataset_final.csv"))
TWIN_DB = os.getenv("TWIN_DB", os.path.join(DATA_DIR, "twin.sqlite"))
