"""Animated, die-cut (transparent) WhatsApp sticker from the Sportify badge.

Compatibility entry point for the shared sports-action generator in
sportify/sticker/make_sticker.py. Running this file updates both export folders.

Outputs (next to this script):
  sportify_sticker.webp     512x512 animated WebP, transparent, <= 500 KB (WhatsApp spec)
  sportify_sticker_hd.webp  1024x1024 high-quality animated WebP (no size cap) for sharing elsewhere
  sportify_tray.png         96x96 tray icon for sticker-pack apps
  _preview_sheet.png        key frames on a checkerboard
  _masks.png                (with --masks) segmentation debug overlay
Run:  python temp/sticker/make_sticker.py [--masks]
Requires Pillow, numpy, scipy.
"""
import math
import random
import runpy
import shutil
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter
from scipy import ndimage

HERE = Path(__file__).resolve().parent
SRC = HERE.parents[1] / "assets" / "Sportify Community Sports Badge.png"

FRAME_MS = 90
LIMIT = 500 * 1024
CX, CY, RING_R, RING_IN = 625, 622, 596, 548  # badge circle in source pixels

LETTER_STAGGER, LETTER_LEN, LETTER_LIFT = 1, 7, 30
SPORT_STAGGER, SPORT_LEN, SPORT_LIFT = 4, 8, 24
HOLD = 4

# Seeds (source px) for geodesic letter splitting; "static" keeps swooshes in place.
LETTER_SEEDS = {
    "S": [(260, 800), (330, 755), (240, 880)],
    "P": [(420, 800), (385, 900), (455, 790)],
    "O": [(520, 820), (500, 850)],
    "R": [(600, 800), (650, 870), (630, 780)],
    "T": [(730, 765), (735, 830), (715, 905)],
    "I": [(795, 790), (785, 860)],
    "F": [(870, 790), (880, 860), (920, 770)],
    "Y": [(960, 800), (930, 900), (1000, 790)],
    "static": [(200, 945), (560, 935), (640, 925), (450, 935), (980, 900), (1030, 870)],
}

# Clockwise from the top-right. Each sport: list of parts (polygon ROI, colour rule).
SPORTS = {
    "badminton": [
        ([(860, 180), (985, 180), (985, 300), (860, 300)], "on_black"),
        ([(985, 268), (1068, 268), (1075, 345), (1115, 400), (1110, 422), (1088, 418), (1050, 355), (985, 335)], "on_black"),
        ([(855, 355), (1000, 350), (1110, 395), (1110, 440), (1050, 470), (1000, 570), (900, 570), (850, 500)], "pink"),
    ],
    "hiking": [
        ([(1012, 545), (1032, 548), (1040, 560), (1030, 575), (1040, 585), (1048, 610), (1052, 625),
          (1040, 640), (1035, 650), (1040, 680), (1045, 700), (1035, 708), (1015, 705), (1012, 690),
          (1000, 660), (990, 690), (985, 705), (965, 705), (965, 695), (975, 680), (980, 650),
          (975, 625), (965, 620), (960, 595), (975, 575), (995, 570), (1005, 565)], "poly"),
        ("line", ((1043, 612), (1063, 725), 5)),
        ("line", ((962, 606), (943, 667), 5)),
    ],
    "table_tennis": [
        ([(1018, 765), (1200, 765), (1200, 960), (1018, 960)], "paddles"),
    ],
    "football": [
        ([(395, 470), (520, 430), (600, 395), (680, 400), (760, 470), (760, 600), (700, 640), (560, 700), (430, 700), (390, 620)], "figure"),
        ("circle", (668, 648, 62)),
    ],
    "carrom": [
        ([(45, 668), (243, 598), (380, 683), (215, 800)], "board"),
    ],
    "cricket": [
        ("circle", (518, 177, 60)),
        ([(300, 205), (470, 205), (470, 350), (300, 350)], "bat"),
        ([(160, 330), (300, 285), (348, 300), (348, 360), (335, 420), (398, 560), (392, 640), (330, 700),
          (240, 700), (175, 560), (160, 430)], "figure"),
    ],
}

PALETTE = [(255, 223, 120), (255, 255, 255), (255, 140, 225), (140, 230, 255)]
random.seed(11)


# ---------- helpers ----------
def label(mask):
    lab, n = ndimage.label(mask)
    sizes = np.bincount(lab.ravel(), minlength=n + 1)
    sizes[0] = 0
    return lab, sizes


def to_img(mask):
    return Image.fromarray((mask > 0).astype(np.uint8) * 255)


def to_mask(img, thr=127):
    return np.asarray(img) > thr


def close(mask, k):
    return to_mask(to_img(mask).filter(ImageFilter.MaxFilter(k)).filter(ImageFilter.MinFilter(k)))


def dilate(mask, k):
    return to_mask(to_img(mask).filter(ImageFilter.MaxFilter(k)))


def fill_holes(mask):
    return ndimage.binary_fill_holes(mask)


def keep_largest(mask, min_frac=0.15):
    lab, sizes = label(mask)
    if len(sizes) <= 1:
        return mask
    big = sizes.max()
    return (sizes[lab] >= big * min_frac) & mask


def poly_mask(shape, pts):
    img = Image.new("L", (shape[1], shape[0]), 0)
    ImageDraw.Draw(img).polygon(pts, fill=255)
    return np.asarray(img) > 0


def circle(shape, x, y, r):
    img = Image.new("L", (shape[1], shape[0]), 0)
    ImageDraw.Draw(img).ellipse((x - r, y - r, x + r, y + r), fill=255)
    return np.asarray(img) > 0


# ---------- segmentation ----------
def colour_rule(rule, a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = a.max(2)
    green = (g > r + 18) & (g > b + 8)
    if rule == "poly":
        return np.ones(mx.shape, bool)
    if rule == "on_black":
        return mx > 45
    if rule == "pink":
        return (r > 120) & (b > 70) & (g < r * 0.75)
    if rule == "paddles":
        streak = (r > 180) & (g > 60) & (g < 150) & (b < 60)
        return (mx > 45) & ~green & ~streak
    if rule == "board":
        return (mx > 30) & ~green
    if rule == "bat":
        return (mx > 45) & (b > 80)
    if rule == "figure":
        blue = (b > r + 15) & (b >= g - 20)
        white = a.min(2) > 170
        navy = (mx < 90) & (mx >= 25) & (b >= r)
        return blue | white | navy
    raise ValueError(rule)


def sport_masks(a):
    shape = a.shape[:2]
    out = {}
    for name, parts in SPORTS.items():
        m = np.zeros(shape, bool)
        for kind, spec in parts:
            if kind == "circle":
                m |= circle(shape, *spec)
                continue
            if kind == "line":
                p0, p1, w = spec
                img = Image.new("L", (shape[1], shape[0]), 0)
                ImageDraw.Draw(img).line((p0, p1), fill=255, width=w)
                m |= np.asarray(img) > 0
                continue
            roi = poly_mask(shape, kind)
            part = colour_rule(spec, a) & roi
            part = close(part, 5)
            part = keep_largest(part & roi)
            part = fill_holes(close(part, 9)) & roi
            m |= part
        out[name] = m
    out["cricket"] &= ~out["carrom"] & ~out["football"]
    return out


def letter_masks(a):
    mx = a.max(2)
    x0, y0, x1, y1 = 150, 690, 1060, 975
    bright = np.zeros(mx.shape, bool)
    bright[y0:y1, x0:x1] = mx[y0:y1, x0:x1] > 150
    owner = np.zeros(mx.shape, np.int8)  # 0 none, 1..8 letters, -1 static
    names = [k for k in LETTER_SEEDS if k != "static"]
    q = deque()
    for idx, key in enumerate(names + ["static"]):
        tag = idx + 1 if key != "static" else -1
        for sx, sy in LETTER_SEEDS[key]:
            ys, xs = np.nonzero(bright[sy - 15:sy + 16, sx - 15:sx + 16])
            if len(ys) == 0:
                continue
            j = np.argmin((ys - 15) ** 2 + (xs - 15) ** 2)
            py, px = sy - 15 + ys[j], sx - 15 + xs[j]
            if owner[py, px] == 0:
                owner[py, px] = tag
                q.append((py, px))
    while q:  # multi-source geodesic BFS
        y, x = q.popleft()
        for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if bright[yy, xx] and owner[yy, xx] == 0:
                owner[yy, xx] = owner[y, x]
                q.append((yy, xx))
    soft = mx > 60
    out = {}
    for i, key in enumerate(names):
        core = owner == i + 1
        others = (owner != 0) & (owner != i + 1)
        out[key] = fill_holes(close(dilate(core, 5) & soft & ~others | core, 3))
    return out


def silhouette(a):
    """Static die-cut alpha: the badge disc; everything outside the gold ring is transparent."""
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    return np.hypot(xx - CX, yy - CY) <= RING_R + 2


# ---------- animation ----------
def bump(i, start, length):
    u = (i - start) / length
    if u <= 0 or u >= 1:
        return 0.0
    return math.sin(math.pi * u) ** 1.5


def element(src_rgba, mask):
    ys, xs = np.nonzero(mask)
    pad = 4
    box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), xs.max() + pad + 1, ys.max() + pad + 1)
    alpha = to_img(mask).filter(ImageFilter.GaussianBlur(0.8)).crop(box)
    layer = src_rgba.crop(box)
    layer.putalpha(ImageChops.multiply(layer.getchannel("A"), alpha))
    side = ImageEnhance.Brightness(layer).enhance(0.38)
    edge = ImageEnhance.Brightness(layer).enhance(0.22)
    return {"box": box, "layer": layer, "side": side, "edge": edge,
            "glints": [(random.uniform(0.1, 0.9), random.uniform(0.0, 0.35)) for _ in range(3)]}


def draw_lifted(canvas, el, k, lift_px):
    """3D pop: extruded side walls from the rest position up to the lifted face."""
    if k <= 0:
        return
    x0, y0, x1, y1 = el["box"]
    h = lift_px * k
    steps = max(1, int(h))
    for s in range(0, steps + 1):
        canvas.alpha_composite(el["edge"] if s == 0 else el["side"], (x0, int(round(y0 - s))))
    scale = 1.0 + 0.06 * k
    face = el["layer"]
    if scale != 1.0:
        w, hh = face.size
        face = face.resize((int(w * scale), int(hh * scale)), Image.LANCZOS)
    face = ImageEnhance.Brightness(face).enhance(1.0 + 0.18 * k)
    fx = x0 - (face.width - (x1 - x0)) // 2
    fy = int(round(y0 - h - (face.height - (y1 - y0))))
    canvas.alpha_composite(face, (fx, fy))
    # Glitter burst kept local to the element so WebP deltas stay small.
    d = ImageDraw.Draw(canvas)
    for j, (u, v) in enumerate(el["glints"]):
        kk = max(0.0, math.sin(math.pi * min(1.0, k * 1.2)) if j % 2 else k)
        star(d, fx + u * face.width, fy + v * face.height, 26 * kk, PALETTE[j % len(PALETTE)], int(255 * min(1.0, kk * 1.4)))


def star(d, x, y, L, color, alpha):
    if L < 1.5:
        return
    w = max(1.0, L * 0.2)
    d.polygon([(x, y - L), (x + w, y - w), (x + L, y), (x + w, y + w),
               (x, y + L), (x - w, y + w), (x - L, y), (x - w, y - w)], fill=color + (alpha,))
    c = max(1.0, w)
    d.ellipse((x - c, y - c, x + c, y + c), fill=(255, 255, 255, alpha))


def finish(frame, size, sparks, t, scale):
    """Crop to badge, resize, then add the white die-cut border + soft shadow."""
    border = max(3, round(6 * scale))
    m = RING_R + 4
    art = frame.crop((CX - m, CY - m, CX + m, CY + m))
    inner = size - 2 * (border + max(2, round(3 * scale)))
    art = art.resize((inner, inner), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    off = (size - inner) // 2
    canvas.alpha_composite(art, (off, off))

    a = canvas.getchannel("A").point(lambda v: 255 if v > 90 else 0)
    outline = a.filter(ImageFilter.MaxFilter(2 * border + 1)).filter(ImageFilter.GaussianBlur(0.6 * scale))
    shadow = outline.filter(ImageFilter.GaussianBlur(2 * scale)).point(lambda v: v * 70 // 255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sh = Image.new("RGBA", (size, size), (0, 0, 0, 255))
    sh.putalpha(shadow)
    out.alpha_composite(sh, (0, max(1, round(2 * scale))))
    white = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    white.putalpha(outline)
    out.alpha_composite(white)
    out.alpha_composite(canvas)

    d = ImageDraw.Draw(out)
    for s in sparks:
        k = math.sin(math.pi * ((t * 2 + s["phase"]) % 1.0)) ** 4
        star(d, s["x"] * scale, s["y"] * scale, s["size"] * scale * k, s["color"], int(255 * min(1.0, 0.25 + k)))
    return out


def build(size_list):
    src = Image.open(SRC).convert("RGB")
    a = np.asarray(src).astype(np.int16)
    print("segmenting...", flush=True)
    alpha = silhouette(a)
    letters = letter_masks(a)
    sports = sport_masks(a)

    src_rgba = src.convert("RGBA")
    src_rgba.putalpha(to_img(alpha).filter(ImageFilter.GaussianBlur(0.8)))

    if "--masks" in sys.argv:
        dbg = src_rgba.copy()
        cols = [(255, 0, 0), (0, 255, 0), (0, 128, 255), (255, 255, 0), (255, 0, 255), (0, 255, 255), (255, 128, 0), (128, 0, 255)]
        for i, m in enumerate(list(letters.values()) + list(sports.values())):
            tint = Image.new("RGBA", src.size, cols[i % len(cols)] + (0,))
            tint.putalpha(to_img(m).point(lambda v: v // 2))
            dbg.alpha_composite(tint)
        bg = Image.new("RGBA", src.size, (40, 40, 40, 255))
        bg.alpha_composite(dbg)
        bg.save(HERE / "_masks.png")
        raise SystemExit("wrote _masks.png")

    els = [(element(src_rgba, m), LETTER_LIFT) for m in letters.values()]
    sport_els = [(element(src_rgba, m), SPORT_LIFT) for m in sports.values()]
    n_letters = len(els)
    sports_start = (n_letters - 1) * LETTER_STAGGER + LETTER_LEN - 3
    frames_total = sports_start + (len(sport_els) - 1) * SPORT_STAGGER + SPORT_LEN + HOLD

    sparks = []

    out = {s: [] for s in size_list}
    print(f"rendering {frames_total} frames...", flush=True)
    for i in range(frames_total):
        frame = src_rgba.copy()
        for j, (el, lift) in enumerate(els):
            draw_lifted(frame, el, bump(i, j * LETTER_STAGGER, LETTER_LEN), lift)
        for j, (el, lift) in enumerate(sport_els):
            draw_lifted(frame, el, bump(i, sports_start + j * SPORT_STAGGER, SPORT_LEN), lift)
        t = i / frames_total
        for s in size_list:
            out[s].append(finish(frame, s, sparks, t, s / 512))
    return out


def save_webp(frames, path, qualities, limit=None):
    for q in qualities:
        frames[0].save(path, save_all=True, append_images=frames[1:], duration=FRAME_MS, loop=0,
                       quality=q, method=4, allow_mixed=True, minimize_size=True,
                       background=(0, 0, 0, 0))
        size = path.stat().st_size
        print(f"  {path.name} q{q}: {size / 1024:.0f} KB", flush=True)
        if limit is None or size <= limit:
            return q, size
    print(f"WARNING: {path.name} is {size} bytes; over the {limit}-byte WhatsApp limit")
    return q, size


def main():
    shared = HERE.parents[2] / "sportify" / "sticker" / "make_sticker.py"
    implementation = runpy.run_path(str(shared))
    stem = implementation["main"]()
    if "--check" in sys.argv:
        shutil.copyfile(shared.parent / "_shots_contact_sheet.jpg",HERE / "_shots_contact_sheet.jpg")
        return
    names = [f"{stem}.webp",f"{stem}.gif","sportify_sticker.webp","sportify_sticker.gif",
             "sportify_tray.png","_preview_sheet.png"]
    if "--hd" in sys.argv:
        names += [f"{stem}_hd.webp","sportify_sticker_hd.webp"]
    for name in names:
        shutil.copyfile(shared.parent / name,HERE / name)
    print(f"Synchronized sports-action exports to {HERE}",flush=True)


if __name__ == "__main__":
    main()
