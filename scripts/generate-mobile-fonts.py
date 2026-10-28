"""Generate static Android font weights from the same Inter source used by web.

Requires fonttools: python -m pip install fonttools
Run from any directory: python scripts/generate-mobile-fonts.py
The source and derived fonts retain the OFL.txt license in assets/fonts/.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

fonts = Path(__file__).resolve().parents[1] / "apps/mobile/assets/fonts"
source = TTFont(fonts / "Inter.ttf")
for weight in (400, 500, 600, 700, 800, 900):
    instance = instantiateVariableFont(source, {"wght": weight, "opsz": 14}, inplace=False)
    instance.save(fonts / f"Inter-{weight}.ttf")
