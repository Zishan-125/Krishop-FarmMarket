"""Regional-language planting/selling advisor.

Turns the numeric signals (forecast, fair-price recommendation, weather) into short,
actionable advice in the farmer's language. Uses the Gemini API (free tier works) when
GEMINI_API_KEY is set; otherwise, or on any error / malformed reply, a deterministic template
(Bangla/English/Swahili) so the feature never goes dark."""
import json
import os
import re

import requests

from . import config

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

CROP_NAME = {
    "bn": {"chickpea": "ছোলা", "cucumber": "শসা", "garlic": "রসুন", "green_chilli": "কাঁচা মরিচ", "sweet_pumpkin": "মিষ্টি কুমড়া"},
    "en": {"chickpea": "chickpea", "cucumber": "cucumber", "garlic": "garlic", "green_chilli": "green chilli", "sweet_pumpkin": "sweet pumpkin"},
    "sw": {"chickpea": "chickpea", "cucumber": "tango", "garlic": "kitunguu saumu", "green_chilli": "pilipili", "sweet_pumpkin": "malenge"},
}
LANGS = {"bn": "Bangla (বাংলা), simple village-level words", "en": "English", "sw": "Swahili"}

# Three short sentences: (1) ask price, (2) sell-or-wait, (3) uncertainty range.
TEMPLATES = {
    "bn": ("{crop} (গ্রেড {grade}) প্রতি কেজি {ask} টাকা চান। {act}। "
           "আগামী ৭ দিনে দাম প্রায় {chg:+.1f}% বদলাতে পারে; এক সপ্তাহ পরে বিক্রি করলে নিট দাম সম্ভবত {low} থেকে {high} টাকার মধ্যে থাকবে।"),
    "en": ("Ask {ask} taka per kg for your {crop} (grade {grade}). {act}. "
           "The price may move about {chg:+.1f}% over 7 days; a week from now the net price will likely land between {low} and {high} taka."),
    "sw": ("Omba shilingi {ask} kwa kilo ya {crop} (daraja {grade}). {act}. "
           "Bei inaweza kubadilika {chg:+.1f}% ndani ya siku 7; baada ya wiki bei halisi huenda kati ya {low} na {high}."),
}
ACTIONS = {
    "bn": {"sell_now": "আজই বিক্রি করুন", "hold": "{n} দিন অপেক্ষা করে বিক্রি করুন"},
    "en": {"sell_now": "Sell today", "hold": "Wait {n} day(s) and then sell"},
    "sw": {"sell_now": "Uza leo", "hold": "Subiri siku {n} kisha uze"},
}


def _fallback(ctx, lang):
    n = int(ctx.get("wait_days") or 0)
    act = ACTIONS[lang]["hold"].format(n=n) if n > 0 else ACTIONS[lang]["sell_now"]
    crop = CROP_NAME[lang].get(ctx.get("crop"), ctx.get("crop", "?"))
    return TEMPLATES[lang].format(crop=crop, grade=ctx.get("grade", "B"), ask=ctx.get("ask_per_kg", "?"), act=act,
                                  chg=ctx.get("expected_change_7d_pct", 0.0), low=ctx.get("low", "?"), high=ctx.get("high", "?"))


_BN = str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯")


def _finish(text: str, lang: str) -> str:
    return text.translate(_BN) if lang == "bn" else text


def _system_prompt(lang: str) -> str:
    return ("You advise smallholder farmers. Reply in " + LANGS[lang] + ". Write EXACTLY three short sentences: "
            "(1) the ask price per kg, (2) sell today or wait N days, (3) the 7-day move and the likely net-price range one week from now. "
            "Use ONLY the numbers given; never invent prices. No greeting, no lists, no markdown.")


def _gemini(ctx: dict, lang: str, key: str, timeout: float = 15.0):
    """One call to the Gemini REST API. Returns the text, or None if anything is off."""
    body = {
        "system_instruction": {"parts": [{"text": _system_prompt(lang)}]},
        "contents": [{"role": "user", "parts": [{"text": json.dumps(ctx, ensure_ascii=False)}]}],
        "generationConfig": {"maxOutputTokens": 400, "temperature": 0.3},
    }
    r = requests.post(GEMINI_URL.format(model=config.GEMINI_MODEL), json=body, timeout=timeout,
                      headers={"x-goog-api-key": key, "Content-Type": "application/json"})
    r.raise_for_status()
    parts = r.json()["candidates"][0]["content"]["parts"]
    text = "".join(p.get("text", "") for p in parts).strip()
    # accept only a reply that really has three sentences; otherwise the template is safer
    sentences = [s for s in re.split(r"[।.!?]+", text) if s.strip()]
    return text if len(sentences) == 3 else None


def advise(ctx: dict, lang: str = "bn") -> dict:
    lang = lang if lang in LANGS else "en"
    key = os.getenv("GEMINI_API_KEY")
    if key:
        try:
            text = _gemini(ctx, lang, key)
            if text:
                return {"lang": lang, "source": "llm", "model": config.GEMINI_MODEL, "text": _finish(text, lang)}
        except Exception:
            pass
    return {"lang": lang, "source": "template", "text": _finish(_fallback(ctx, lang), lang)}
