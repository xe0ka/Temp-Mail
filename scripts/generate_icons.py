import os
from PIL import Image, ImageDraw, ImageFilter

W = 1024
ROUND = 228

def lerp(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def v_gradient(size, c1, c2):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for y in range(size):
        d.line([(0, y), (size, y)], fill=lerp(c1, c2, y / size))
    return img

def rounded_mask(size, radius):
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return m

def bolt_points(cx, cy, s):
    pts = [
        (-20, -60), (40, -60), (15, -5), (40, -5),
        (-25, 65), (0, 10), (-35, 10), (-15, -60),
    ]
    return [(cx + x * s, cy + y * s) for x, y in pts]

def draw_envelope_glyph(d, ew, eh, body_top, body_bot, flap_col, seam_col, glow=None):
    cx = W * 0.5
    x0 = int(cx - ew / 2)
    y0 = int(W * 0.5 - eh / 2)
    x1 = int(cx + ew / 2)
    y1 = int(W * 0.5 + eh / 2)
    mid = int(y0 + eh * 0.52)

    # subtle drop glow behind envelope
    if glow:
        sh = Image.new("RGBA", (int(ew * 1.7), int(eh * 1.7)), (0, 0, 0, 0))
        ImageDraw.Draw(sh).ellipse([0, 0] + list(sh.size), fill=(90, 80, 220, glow))
        sh = sh.filter(ImageFilter.GaussianBlur(70))
        bg_glow = Image.new("RGBA", (W, W), (0, 0, 0, 0))
        bg_glow.paste(sh, (int(cx - sh.width / 2), int(y0 + eh * 0.15 - sh.height / 2)))
        d._img.alpha_composite(bg_glow)

    # body
    d.rounded_rectangle([x0, y0, x1, y1], radius=42, fill=body_top)
    d.rectangle([x0, mid - 6, x1, y1], fill=body_bot)
    d.rounded_rectangle([x0, y0, x1, mid + 4], radius=42, fill=body_top)
    # flap
    d.polygon([(x0, y0), (x1, y0), (int(cx), mid)], fill=flap_col)
    # seams
    d.line([(x0, y0), (int(cx), mid)], fill=seam_col, width=7)
    d.line([(x1, y0), (int(cx), mid)], fill=seam_col, width=7)
    return x0, y0, x1, y1, cx, mid

def bolt_color(d, cx, cy, scale, fill, outline_w=0.72):
    if outline_w and outline_w < scale:
        d.polygon(bolt_points(cx, cy, scale), fill=(255, 255, 255, 255))
    d.polygon(bolt_points(cx, cy, outline_w), fill=fill)

# ---------------------------------------------------------------------------
# 1) Splash / glyph asset (transparent): white envelope + light violet bolt
# ---------------------------------------------------------------------------
glyph = Image.new("RGBA", (W, W), (0, 0, 0, 0))
g = ImageDraw.Draw(glyph)
g._img = glyph
ew, eh = 470, 360
x0, y0, x1, y1, cx, mid = draw_envelope_glyph(
    g, ew, eh, (243, 246, 255, 255), (243, 246, 255, 255), (139, 123, 246, 255), (189, 195, 220, 255)
)
bolt_cy = y1 - int(eh * 0.45)
bolt_color(g, cx, bolt_cy, 150, (139, 123, 246, 255))
glyph.save("assets/splash-icon.png")

# ---------------------------------------------------------------------------
# 2) Adaptive foreground: white glyph centered, safe zone
# ---------------------------------------------------------------------------
fg = Image.new("RGBA", (W, W), (0, 0, 0, 0))
fd = ImageDraw.Draw(fg)
fd._img = fg
f_ew, f_eh = 440, 340
fx0, fy0, fx1, fy1, fcx, fmid = draw_envelope_glyph(
    fd, f_ew, f_eh, (255, 255, 255, 255), (255, 255, 255, 255), (255, 255, 255, 255), (210, 214, 235, 255)
)
f_bolt_cy = fy1 - int(f_eh * 0.45)
bolt_color(fd, fcx, f_bolt_cy, 140, (139, 123, 246, 255))
fg.save("assets/android-icon-foreground.png")

# ---------------------------------------------------------------------------
# 3) Adaptive background: solid dark color
# ---------------------------------------------------------------------------
Image.new("RGBA", (W, W), (20, 22, 40, 255)).save("assets/android-icon-background.png")

# ---------------------------------------------------------------------------
# 4) Monochrome: fully white glyph
# ---------------------------------------------------------------------------
mono = Image.new("RGBA", (W, W), (0, 0, 0, 0))
md = ImageDraw.Draw(mono)
md._img = mono
m_ew, m_eh = 440, 340
_ = draw_envelope_glyph(
    md, m_ew, m_eh, (255, 255, 255, 255), (255, 255, 255, 255), (255, 255, 255, 255), (200, 204, 225, 255)
)
m_bolt_cy = fy1 - int(f_eh * 0.45)  # same as foreground
bolt_color(md, fcx, m_bolt_cy, 140, (255, 255, 255, 255), outline_w=0)
mono.save("assets/android-icon-monochrome.png")

# ---------------------------------------------------------------------------
# 5) App icon: dark gradient bg + glow + white envelope + violet bolt
# ---------------------------------------------------------------------------
bg = v_gradient(W, (11, 13, 18), (26, 19, 58))
mask = rounded_mask(W, ROUND)
bg.putalpha(mask)

glow_layer = Image.new("RGBA", (W, W), (0, 0, 0, 0))
ImageDraw.Draw(glow_layer).ellipse([W * 0.12, W * 0.18, W * 0.88, W * 0.86], fill=(108, 92, 231, 130))
glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(110))
bg.alpha_composite(glow_layer)

i = ImageDraw.Draw(bg)
i._img = bg
i_ew, i_eh = 540, 400
ix0, iy0, ix1, iy1, icx, imid = draw_envelope_glyph(
    i, i_ew, i_eh, (242, 245, 255, 255), (242, 245, 255, 255), (124, 108, 240, 255), (184, 190, 216, 255), glow=0
)
i_bolt_cy = iy1 - int(i_eh * 0.44)
bolt_color(i, icx, i_bolt_cy, 170, (66, 55, 176, 255))

# soft top highlight on envelope
i.rounded_rectangle([ix0 + 14, iy0 + 8, ix1 - 14, iy0 + 42], radius=20, fill=(255, 255, 255, 40))
bg.save("assets/icon-1024.png")

os.replace("assets/icon-1024.png", "assets/icon.png")

# ---------------------------------------------------------------------------
# 6) Favicon (48x48 from app icon)
# ---------------------------------------------------------------------------
fav = bg.resize((48, 48), Image.LANCZOS).convert("RGBA")
fav.save("assets/favicon.png")

print("icons regenerated OK")