"""SAGE ONE — primary logo builder.

Combines the two supplied source images:
  1. iridescent glass sphere with orbital rings
  2. SAGE ONE emblem / lockup

Geometry is measured from the sources at run time:
  * sphere ball   -> bright blob center + diameter
  * emblem circle -> bright rows above the wordmark gap

Both are aligned to the canvas center and scaled so the S sits inside the
glass ball, with the sphere's rings reaching out past it.

Outputs into ./img:
  contact.png      2x2 sheet of blend/scale variants
  sage-mark.png    square mark (screen blend), transparent outside the badge
  sage-lockup.png  full logo (mark + SAGE ONE wordmark) with the sphere blended in
"""
import os
import sys
import numpy as np
from PIL import Image

SPHERE = r"C:\Users\Nishant\AppData\Local\Temp\freebuff-desktop-pastes\paste-1791878121385-11908.png"
LOGO = r"C:\Users\Nishant\Pictures\songs\content-(81) oooo.png"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "img")

CANVAS = 1024
BADGE_R = CANVAS // 2

# target diameters on the canvas (px)
BALL_D = 620          # glass sphere body
CIRCLE_D = 560        # emblem glow circle (S sits inside the ball)

# variant blends / scales for the contact sheet
VARIANTS = [("screen", 1.00), ("lighten", 1.00), ("screen", 1.12), ("lighten", 1.12)]


# ---------------------------------------------------------------- measurement
def sphere_geom(img):
    """Ball center (cx, cy) and diameter in source pixels."""
    a = np.asarray(img.convert("RGB")).astype(np.int16)
    m = a.max(axis=2) > 30
    cols = [i for i, v in enumerate(m.sum(axis=0)) if v > 150]
    rows = [i for i, v in enumerate(m.sum(axis=1)) if v > 150]
    cx = (min(cols) + max(cols)) / 2 if cols else a.shape[1] / 2
    cy = (min(rows) + max(rows)) / 2 if rows else a.shape[0] / 2
    d = (max(rows) - min(rows) + 1) if rows else a.shape[0] * 0.75
    return float(cx), float(cy), float(d)


def logo_geom(img):
    """Emblem circle center + diameter, and the row where the wordmark starts."""
    a = np.asarray(img.convert("RGB")).astype(np.int16)
    lum = a.max(axis=2)
    mask = lum > 60
    widths = mask.sum(axis=1)
    thick = [i for i, v in enumerate(widths) if v > 5]
    cut = a.shape[0]
    for prev, nxt in zip(thick, thick[1:]):
        if nxt - prev > 12:               # gap between emblem and wordmark
            cut = prev
            break
    rows = [i for i in range(cut) if widths[i] >= 60]
    y0, y1 = (min(rows), max(rows)) if rows else (0, cut)
    sub = mask[:cut, :]
    xs = np.where(sub.any(axis=0))[0]
    cx = float(xs.min() + xs.max()) / 2
    # width is circle diameter; the vertical beam makes rows taller than wide
    d = float(xs.max() - xs.min() + 1)
    cy = (y0 + y1) / 2.0
    return cx, cy, d, cut


# ---------------------------------------------------------------- compositing
def paste_scaled(canvas, img, w, h, cx, cy):
    r = img.convert("RGBA").resize((max(1, int(round(w))), max(1, int(round(h)))), Image.LANCZOS)
    canvas.paste(r, (int(round(cx - w / 2)), int(round(cy - h / 2))), r)


def blend(base, top, mode):
    b = np.asarray(base).astype(np.float32)
    t = np.asarray(top).astype(np.float32)
    br, ba = b[..., :3] / 255.0, b[..., 3:4] / 255.0
    tr, ta = t[..., :3] / 255.0, t[..., 3:4] / 255.0
    rgb = np.maximum(br, tr) if mode == "lighten" else 1.0 - (1.0 - br) * (1.0 - tr)
    alpha = np.clip(ba + ta * (1.0 - ba), 0, 1)
    out = np.dstack([np.clip(rgb, 0, 1) * 255.0, alpha * 255.0]).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def badge_alpha(size, feather=0.06):
    y, x = np.mgrid[0:size, 0:size]
    d = np.sqrt((x - size / 2 + .5) ** 2 + (y - size / 2 + .5) ** 2) / (size / 2)
    return (np.clip((1.0 - d) / feather, 0, 1) * 255).astype(np.uint8)


def emblem_layer(logo, geom, target_d, out_size):
    """Emblem only (wordmark cropped away), circle centred, scaled to target_d."""
    cx, cy, d, cut = geom
    crop = logo.crop((0, 0, logo.width, cut))
    side = int(d * 1.19)                            # margin around the circle
    pad = Image.new("RGBA", (side, side), (0, 0, 0, 255))
    pad.paste(crop, (int(side / 2 - cx), int(side / 2 - cy)), crop)
    target = int(round(side * target_d / d))
    return pad.resize((target, target), Image.LANCZOS)


def make_mark(sphere, logo, mode="screen", scale=1.0, badge=True):
    scx, scy, sd = sphere_geom(sphere)
    lg = logo_geom(logo)

    art = Image.new("RGBA", (CANVAS, CANVAS), (3, 6, 16, 255))

    # glass sphere: ball centred on the canvas, sized so rings stay inside badge
    ball = BALL_D * scale
    k = ball / sd
    sw, sh = sphere.width * k, sphere.height * k
    ox = CANVAS / 2 - scx * k
    oy = CANVAS / 2 - scy * k
    r = sphere.convert("RGBA").resize((int(sw), int(sh)), Image.LANCZOS)
    art.paste(r, (int(ox), int(oy)), r)

    # emblem: circle centred on the canvas, S sitting inside the ball
    emb = emblem_layer(logo, lg, CIRCLE_D * scale, CANVAS)
    layer = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 255))
    layer.paste(emb, (int((CANVAS - emb.width) / 2), int((CANVAS - emb.height) / 2)), emb)
    art = blend(art, layer, mode)

    if badge:
        a = np.asarray(art).copy()
        a[..., 3] = np.minimum(a[..., 3], badge_alpha(CANVAS))
        art = Image.fromarray(a, "RGBA")
    return art


def make_lockup(sphere, logo, mode="screen"):
    """Full lockup: emblem + wordmark with the glass sphere over the emblem."""
    scx, scy, sd = sphere_geom(sphere)
    cx, cy, d, cut = logo_geom(logo)
    base = logo.copy()
    layer = Image.new("RGBA", logo.size, (0, 0, 0, 255))
    k = (d * 0.75) / sd                             # ball = 75% of the circle
    sw, sh = sphere.width * k, sphere.height * k
    r = sphere.convert("RGBA").resize((int(sw), int(sh)), Image.LANCZOS)
    layer.paste(r, (int(cx - scx * k), int(cy - scy * k)), r)
    return blend(base, layer, mode)


def ascii_map(im, n=52):
    a = np.asarray(im).astype(np.float32)
    rgb, al = a[..., :3], a[..., 3] / 255.0
    lum = (rgb.max(axis=2) / 255.0) * al
    step = lum.shape[0] // n
    g = lum[:n * step, :n * step]
    grid = g.reshape(n, step, n, step).mean(axis=(1, 3))
    ramp = " .:-=+*#%@"
    return "\n".join("".join(ramp[min(9, int(v * 10))] for v in row) for row in grid)


def main():
    os.makedirs(OUT, exist_ok=True)
    sphere = Image.open(SPHERE).convert("RGB")
    logo = Image.open(LOGO).convert("RGBA")
    print("sphere geom", sphere_geom(sphere), "logo geom", logo_geom(logo))

    cells = [(f"{m} x{s:.2f}", make_mark(sphere, logo, m, s)) for m, s in VARIANTS]

    cell, pad = 440, 14
    from PIL import ImageDraw
    sheet = Image.new("RGB", (cell * 2 + pad * 3, cell * 2 + pad * 3), (115, 118, 126))
    d = ImageDraw.Draw(sheet)
    for i, (label, im) in enumerate(cells):
        x = pad + (i % 2) * (cell + pad)
        y = pad + (i // 2) * (cell + pad)
        bg = Image.new("RGBA", (cell, cell), (115, 118, 126, 255))
        bg.alpha_composite(im.resize((cell, cell), Image.LANCZOS))
        sheet.paste(bg.convert("RGB"), (x, y))
        d.rectangle([x + 6, y + 6, x + 170, y + 30], fill=(0, 0, 0))
        d.text((x + 12, y + 11), label, fill=(255, 255, 255))
    sheet.save(os.path.join(OUT, "contact.png"))

    idx = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    mark = cells[idx][1]
    mark.resize((512, 512), Image.LANCZOS).save(os.path.join(OUT, "sage-mark.png"), optimize=True)
    make_lockup(sphere, logo).save(os.path.join(OUT, "sage-lockup.png"), optimize=True)

    print("\n--- chosen:", cells[idx][0], "---")
    print(ascii_map(mark))
    for f in ("contact.png", "sage-mark.png", "sage-lockup.png"):
        p = os.path.join(OUT, f)
        print("wrote", p, os.path.getsize(p), "bytes")


if __name__ == "__main__":
    main()
