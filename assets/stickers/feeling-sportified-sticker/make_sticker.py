"""Animated 'feeling SPORTIFIED' sticker using the original badge brushwork.

Run with the repository .venv Python and optional --check.
Requires the badge generator's Pillow, numpy, scipy and opencv dependencies.
SPORTIF are extracted; E uses F strokes and D has a matching custom brush contour.
Exports animated WebP/GIF, a transparent 2048px PNG and an HD animated WebP.
WebP needs importing through a compatible sticker app; Instagram support varies.
"""

import math
import importlib.util
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFont
from scipy.ndimage import maximum_filter


HERE = Path(__file__).resolve().parent
FONTS = Path("C:/Windows/Fonts")
SIZE = 2048
FRAME_MS = 50
FRAME_COUNT = 40
LIMIT = 500 * 1024
WORD = "SPORTIFIED"


def extract_logo_letters():
    source_path = HERE.parent / "sticker-3" / "make_sticker.py"
    spec = importlib.util.spec_from_file_location("sportify_badge", source_path)
    assert spec and spec.loader
    badge = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(badge)
    source = Image.open(badge.SRC).convert("RGBA")
    pixels = np.asarray(source.convert("RGB")).astype(np.int32)
    masks = badge.letter_masks(pixels)
    letters = {}
    for character, mask in masks.items():
        labels, sizes = badge.label(mask)
        mask = labels == sizes.argmax()
        if character == "S":
            tail = badge.poly_mask(mask.shape, [(145, 1005), (248, 874),
                (348, 838), (374, 858), (300, 930), (180, 995)])
            warm = (pixels[:, :, 0] > 170) & (pixels[:, :, 1] > 110)
            mask |= tail & warm
        face = source.copy()
        face.putalpha(badge.to_img(mask))
        bounds = face.getbbox()
        assert bounds, character
        face = face.crop(bounds)
        letters[character] = face
    original_f = letters["F"]
    letter_e = original_f.copy()
    arm = original_f.crop((0, 0, original_f.width, 48))
    arm = arm.resize((round(original_f.width * 0.77), 34), Image.Resampling.LANCZOS)
    letter_e.alpha_composite(arm, (1, original_f.height - 44))
    letters["E"] = recolor(letter_e, (40, 211, 255), (0, 155, 239))
    letter_d = letters["O"].resize((150, 195), Image.Resampling.LANCZOS)
    letter_d = recolor(letter_d, (255, 242, 151), (255, 186, 24))
    contour = Image.new("L", (600, 780))
    outline = [(43, 3), (55, 6), (64, 0), (74, 4), (97, 3), (119, 8),
        (135, 20), (144, 39), (145, 61), (140, 85), (129, 111),
        (112, 137), (92, 159), (67, 178), (42, 188), (9, 195),
        (16, 184), (2, 192), (9, 173), (0, 180), (42, 20), (37, 18)]
    counter = [(65, 38), (88, 36), (105, 43), (111, 58), (108, 80),
        (96, 106), (78, 129), (55, 147), (36, 153)]
    draw = ImageDraw.Draw(contour)
    draw.polygon([(x * 4, y * 4) for x, y in outline], fill=255)
    draw.polygon([(x * 4, y * 4) for x, y in counter], fill=0)
    letter_d.putalpha(contour.resize(letter_d.size, Image.Resampling.LANCZOS))
    letters["D"] = letter_d
    sheet = Image.new("RGB", (1800, 360), "#202426")
    draw = ImageDraw.Draw(sheet)
    for index, character in enumerate("SPORTIFYED"):
        sample = letters[character].copy()
        sample.thumbnail((174, 280), Image.Resampling.LANCZOS)
        sheet.paste(sample, (index * 180 + 3, 45), sample)
        draw.text((index * 180 + 65, 14), character, fill="white")
    sheet.save(HERE / "_extracted_letters.png")
    print("PASS: original SPORTIFY glyphs extracted; E/D built from original strokes", flush=True)
    return letters


def recolor(face, top, bottom):
    ramp = np.linspace(0, 1, face.height)[:, None, None]
    colors = np.array(top)[None, None, :] * (1 - ramp)
    colors = colors + np.array(bottom)[None, None, :] * ramp
    colors = np.broadcast_to(colors, (face.height, face.width, 3)).copy()
    brightness = np.asarray(face.convert("RGB"), dtype=np.float32).max(axis=2, keepdims=True)
    colors *= np.clip(brightness / 245, 0.72, 1.04)
    result = Image.fromarray(np.uint8(np.clip(colors, 0, 255))).convert("RGBA")
    alpha = np.asarray(face.getchannel("A")).copy()
    alpha[brightness[:, :, 0] < 90] = 0
    result.putalpha(Image.fromarray(alpha))
    return result


def pulse(frame, start, duration):
    progress = (frame - start) / duration
    return math.sin(math.pi * progress) ** 1.5 if 0 < progress < 1 else 0


def prepare():
    originals = extract_logo_letters()
    heights = (246, 216, 164, 182, 203, 188, 203, 188, 203, 198)
    offsets = (-28, 12, 16, 14, -2, 5, -2, 5, -2, 4)
    faces = []
    for character, height in zip(WORD, heights):
        original = originals[character]
        width = round(original.width * height / original.height)
        faces.append(original.resize((width * 2, height * 2), Image.Resampling.LANCZOS))
    gap = 9
    total = sum(face.width for face in faces) + gap * 2 * (len(faces) - 1)
    scale = 1856 / total
    letters = []
    left = 96
    for face, offset in zip(faces, offsets):
        face = face.resize((round(face.width * scale), round(face.height * scale)),
                           Image.Resampling.LANCZOS)
        letters.append({"face": face, "left": round(left),
                        "top": 1040 + round(offset * 2 * scale)})
        left += face.width + gap * 2 * scale
    font = ImageFont.truetype(str(FONTS / "BRUSHSCI.TTF"), 480)
    bounds = font.getbbox("feeling")
    feeling = Image.new("RGBA", (bounds[2] - bounds[0] + 60, bounds[3] - bounds[1] + 60))
    ImageDraw.Draw(feeling).text((30 - bounds[0], 30 - bounds[1]), "feeling",
                                 font=font, fill="#fffbea")
    feeling = feeling.rotate(7, Image.Resampling.BICUBIC, expand=True)
    feeling.thumbnail((1110, 550), Image.Resampling.LANCZOS)
    return feeling, letters


def render(index, feeling, letters):
    art = Image.new("RGBA", (SIZE, SIZE))
    art.alpha_composite(feeling, ((SIZE - feeling.width) // 2, 490))
    for position, letter in enumerate(letters):
        amount = pulse(index, 3 + position * 2, 9)
        art.alpha_composite(letter["face"], (letter["left"], letter["top"] - round(30 * amount)))
    black_mask = grow(art.getchannel("A"), 29)
    outlined = colored_mask(black_mask, "#101416")
    outlined.alpha_composite(art)
    shadow = Image.new("RGBA", art.size)
    for depth in range(18, 0, -3):
        shadow.alpha_composite(colored_mask(black_mask, "#101416"), (depth // 2, depth))
    shadow.alpha_composite(outlined)
    cutline = grow(shadow.getchannel("A"), 23)
    final = colored_mask(cutline, "#ffffff")
    final.alpha_composite(shadow)
    return final


def colored_mask(mask, color):
    result = Image.new("RGBA", mask.size, color)
    result.putalpha(mask)
    return result


def grow(mask, size):
    return Image.fromarray(maximum_filter(np.asarray(mask), size=size))


def resize(frame, side):
    frame = frame.resize((side, side), Image.Resampling.LANCZOS)
    frame.putalpha(frame.getchannel("A").point(lambda value: 255 if value >= 128 else 0))
    return frame


def validate(frames):
    for index, frame in enumerate(frames):
        box = frame.getbbox()
        assert box and min(box[:2]) >= 8 and max(box[2:]) <= 504, (index, "clipped sticker", box)
        assert frame.getpixel((0, 0))[3] == 0
        assert frame.getchannel("A").getextrema() == (0, 255)
        assert not frame.getchannel("A").crop((0, 350, 512, 512)).getbbox(), "Lower swoosh remains"
    assert not ImageChops.difference(frames[0], frames[-1]).getbbox(), "Loop endpoints differ"
    difference = np.asarray(ImageChops.difference(frames[0], frames[15]).convert("RGB"))
    assert np.count_nonzero(difference.max(axis=2) > 25) > 250, "Letter wave must be visible"
    print(f"PASS: {len(frames)} frames, {len(frames) * FRAME_MS} ms, unclipped text, transparent background and seamless loop")


def preview(frames):
    canvas = Image.new("RGB", (1024, 1024))
    for index, (background, frame_index) in enumerate((("#f1f3f4", 0), ("#192625", 0),
                                                        ("#f1f3f4", 15), ("#192625", 15))):
        panel = Image.new("RGBA", (512, 512), background)
        panel.alpha_composite(frames[frame_index])
        canvas.paste(panel.convert("RGB"), ((index % 2) * 512, (index // 2) * 512))
    canvas.save(HERE / "_preview.jpg", quality=94)


def save_webp(frames, path, qualities, limit=None):
    for quality in qualities:
        frames[0].save(path, save_all=True, append_images=frames[1:], duration=FRAME_MS,
                       loop=0, quality=quality, method=6, allow_mixed=True,
                       minimize_size=True, background=(0, 0, 0, 0))
        size = path.stat().st_size
        print(f"{path.name}: quality {quality}, {size / 1024:.1f} KB", flush=True)
        if limit is None or size <= limit:
            return
    raise ValueError(f"{path.name} exceeds {limit} bytes")


def main():
    if "--extract-check" in sys.argv:
        extract_logo_letters()
        return
    feeling, letters = prepare()
    high = [render(index, feeling, letters) for index in range(FRAME_COUNT)]
    frames = [resize(frame, 512) for frame in high]
    validate(frames)
    preview(frames)
    if "--check" in sys.argv:
        return
    save_webp(frames, HERE / "feeling_sportified.webp", (90, 85, 75, 65, 55), LIMIT)
    save_webp([resize(frame, 1024) for frame in high], HERE / "feeling_sportified_hd.webp", (94,))
    high[0].save(HERE / "feeling_sportified.png", optimize=True)
    gif_frames = []
    for frame in frames:
        palette = frame.convert("RGB").quantize(colors=255, method=Image.Quantize.MEDIANCUT,
                                                dither=Image.Dither.NONE)
        palette.paste(255, mask=frame.getchannel("A").point(lambda value: 255 if value < 128 else 0))
        gif_frames.append(palette)
    gif_frames[0].save(HERE / "feeling_sportified.gif", save_all=True,
                       append_images=gif_frames[1:], duration=FRAME_MS, loop=0,
                       transparency=255, disposal=2, optimize=False)
    print("Wrote separate text sticker, HD animation, transparent PNG and GIF")


if __name__ == "__main__":
    main()