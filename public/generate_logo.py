from PIL import Image, ImageDraw, ImageFont
import math, os

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

BG      = (10, 10, 18)
INDIGO  = (99, 102, 241)
CYAN    = (34, 211, 238)
WHITE   = (255, 255, 255)
DIM     = (160, 168, 200)

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def rr(draw, x0, y0, x1, y1, r, fill):
    """Filled rounded rectangle."""
    draw.rectangle([x0+r, y0, x1-r, y1], fill=fill)
    draw.rectangle([x0, y0+r, x1, y1-r], fill=fill)
    for cx, cy in [(x0+r, y0+r), (x1-r, y0+r), (x0+r, y1-r), (x1-r, y1-r)]:
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=fill)

def ring(draw, cx, cy, rw, rh, thick, color, cutout=BG):
    """Hollow rounded-rect ring."""
    r_out = min(rh, rw * 0.45)
    rr(draw, cx-rw, cy-rh, cx+rw, cy+rh, int(r_out), color)
    r_in  = max(r_out - thick, 2)
    rr(draw, cx-rw+thick, cy-rh+thick, cx+rw-thick, cy+rh-thick, int(r_in), cutout)

# ── ICON 512×512 ──────────────────────────────────────────────────
S = 512
img = Image.new("RGB", (S, S), BG)
d   = ImageDraw.Draw(img)

# soft bg glow
for gr in range(180, 0, -3):
    t = (1 - gr / 180) ** 2
    gc = lerp(BG, INDIGO, t * 0.22)
    d.ellipse([S//2-gr, S//2-gr, S//2+gr, S//2+gr], fill=gc)

cx, cy = S//2, S//2
RW, RH = 110, 56       # half-width, half-height of each ring
THICK  = 26            # stroke thickness
OFFSET = 68            # horizontal offset between ring centres

# --- draw order for interlock (painter's algorithm):
# 1. full right ring (cyan)    — behind
# 2. left half of left ring (indigo) — in front on left side
# 3. right half of left ring  — behind on right side (covered by right ring top/bottom)
# We achieve this by drawing:
#   (a) right ring fully
#   (b) left ring fully  (overwrites centre of right ring — that's OK for top/bottom strands)
#   (c) re-draw the right ring's CENTRE VERTICAL BAND over the left ring's right portion

rx, lx = cx + OFFSET//2, cx - OFFSET//2

# (a) right ring
ring(d, rx, cy, RW, RH, THICK, CYAN)

# (b) left ring
ring(d, lx, cy, RW, RH, THICK, INDIGO)

# (c) restore right ring over the overlap zone so it appears to pass BEHIND left ring's
#     top and bottom strands but IN FRONT inside the left ring hole.
# The overlap zone x-range:
ov_x0 = rx - RW
ov_x1 = lx + RW

# Re-draw the right ring top/bottom strands in the overlap zone at full cyan
# then re-punch the left ring's INTERIOR (hole) cutout so left ring looks solid
for px in range(int(ov_x0), int(ov_x1) + 1):
    # top strand of right ring
    for py in range(int(cy - RH), int(cy - RH + THICK) + 1):
        d.point((px, py), fill=CYAN)
    # bottom strand of right ring
    for py in range(int(cy + RH - THICK), int(cy + RH) + 1):
        d.point((px, py), fill=CYAN)

# Punch the left ring's interior hole back so it stays transparent above right ring
r_out_l = min(RH, RW * 0.45)
r_in_l  = max(r_out_l - THICK, 2)
rr(d, lx-(RW-THICK), cy-(RH-THICK), lx+(RW-THICK), cy+(RH-THICK), int(r_in_l), BG)

# Re-draw left ring left side (to restore any damage)
rr(d, lx-RW, cy-RH, lx, cy+RH, int(r_out_l), INDIGO)
rr(d, lx-RW+THICK, cy-RH+THICK, lx, cy+RH-THICK, int(r_in_l), BG)

# gradient accent line across the interlock seam
for py in range(int(cy-RH-2), int(cy+RH+3)):
    t = (py - (cy-RH)) / (2*RH + 1)
    # subtle vertical gradient line at seam
    d.point((int((lx+rx)//2), py), fill=lerp(INDIGO, CYAN, 0.5))

# clean app icon frame
PAD, FRAD = 28, 88
rr(d, PAD, PAD, S-PAD, S-PAD, FRAD, (22, 22, 35))   # frame fill (slightly lighter)
# re-draw icon on top of frame by compositing — just re-run draws
for gr in range(120, 0, -3):
    t = (1 - gr / 120) ** 2
    gc = lerp((22,22,35), INDIGO, t * 0.18)
    d.ellipse([S//2-gr, S//2-gr, S//2+gr, S//2+gr], fill=gc)

ring(d, rx, cy, RW, RH, THICK, CYAN)
ring(d, lx, cy, RW, RH, THICK, INDIGO)
for px in range(int(ov_x0), int(ov_x1) + 1):
    for py in range(int(cy - RH), int(cy - RH + THICK) + 1):
        d.point((px, py), fill=CYAN)
    for py in range(int(cy + RH - THICK), int(cy + RH) + 1):
        d.point((px, py), fill=CYAN)
rr(d, lx-(RW-THICK), cy-(RH-THICK), lx+(RW-THICK), cy+(RH-THICK), int(r_in_l), (22,22,35))
rr(d, lx-RW, cy-RH, lx, cy+RH, int(r_out_l), INDIGO)
rr(d, lx-RW+THICK, cy-RH+THICK, lx, cy+RH-THICK, int(r_in_l), (22,22,35))

# frame border hairline
for w in range(2):
    x0,y0,x1,y1 = PAD-w, PAD-w, S-PAD+w, S-PAD+w
    rr(d, x0, y0, x1, y1, FRAD+w, (40,42,68))
    rr(d, x0+2, y0+2, x1-2, y1-2, FRAD, (22,22,35))

# re-draw icon one final time
ring(d, rx, cy, RW, RH, THICK, CYAN)
ring(d, lx, cy, RW, RH, THICK, INDIGO)
for px in range(int(ov_x0), int(ov_x1) + 1):
    for py in range(int(cy - RH), int(cy - RH + THICK) + 1):
        d.point((px, py), fill=CYAN)
    for py in range(int(cy + RH - THICK), int(cy + RH) + 1):
        d.point((px, py), fill=CYAN)
rr(d, lx-(RW-THICK), cy-(RH-THICK), lx+(RW-THICK), cy+(RH-THICK), int(r_in_l), (22,22,35))
rr(d, lx-RW, cy-RH, lx, cy+RH, int(r_out_l), INDIGO)
rr(d, lx-RW+THICK, cy-RH+THICK, lx, cy+RH-THICK, int(r_in_l), (22,22,35))

img.save(os.path.join(OUTPUT_DIR, "icon.png"), "PNG")
print("icon.png saved")

# ── HORIZONTAL LOCKUP 880×220 ─────────────────────────────────────
LW, LH = 880, 220
logo = Image.new("RGB", (LW, LH), BG)
ld   = ImageDraw.Draw(logo)

# glow
for gr in range(100, 0, -2):
    t = (1 - gr/100)**2
    gc = lerp(BG, INDIGO, t*0.15)
    ld.ellipse([LH//2-gr, LH//2-gr, LH//2+gr, LH//2+gr], fill=gc)

# mini icon
icx, icy = LH//2, LH//2
rws, rhs, tks, offs = 46, 24, 11, 28
rx2, lx2 = icx+offs//2, icx-offs//2
ov0, ov1 = rx2-rws, lx2+rws
r_out2 = min(rhs, rws*0.45)
r_in2  = max(r_out2 - tks, 2)

ring(ld, rx2, icy, rws, rhs, tks, CYAN)
ring(ld, lx2, icy, rws, rhs, tks, INDIGO)
for px in range(int(ov0), int(ov1)+1):
    for py in range(int(icy-rhs), int(icy-rhs+tks)+1):
        ld.point((px, py), fill=CYAN)
    for py in range(int(icy+rhs-tks), int(icy+rhs)+1):
        ld.point((px, py), fill=CYAN)
rr(ld, lx2-(rws-tks), icy-(rhs-tks), lx2+(rws-tks), icy+(rhs-tks), int(r_in2), BG)
rr(ld, lx2-rws, icy-rhs, lx2, icy+rhs, int(r_out2), INDIGO)
rr(ld, lx2-rws+tks, icy-rhs+tks, lx2, icy+rhs-tks, int(r_in2), BG)

# text
FONT_PATHS = [
    "C:/Windows/Fonts/segoeuil.ttf",
    "C:/Windows/Fonts/segoeui.ttf",
    "C:/Windows/Fonts/calibril.ttf",
    "C:/Windows/Fonts/calibri.ttf",
    "C:/Windows/Fonts/arial.ttf",
]
def load_font(size):
    for fp in FONT_PATHS:
        try: return ImageFont.truetype(fp, size)
        except: pass
    return ImageFont.load_default()

nf = load_font(74)
tf = load_font(20)

name, tag = "snip.", "short links, instantly"
tx = LH + 20

# gradient name text
nb = ld.textbbox((0,0), name, font=nf)
nw, nh = nb[2]-nb[0], nb[3]-nb[1]
ny = LH//2 - nh//2 - 6
ty = ny + nh + 2

tmp = Image.new("RGB", (nw+4, nh+4), BG)
td  = ImageDraw.Draw(tmp)
td.text((-nb[0], -nb[1]), name, font=nf, fill=WHITE)
ta  = tmp.load()
la  = logo.load()
for py in range(tmp.height):
    for px in range(tmp.width):
        src = ta[px, py]
        if src != BG:
            t = px / max(tmp.width-1, 1)
            g = lerp(INDIGO, CYAN, t)
            lum = src[0]/255.0
            final = lerp(BG, g, lum)
            dx, dy = tx+px, ny+py
            if 0 <= dx < LW and 0 <= dy < LH:
                la[dx, dy] = final

ld.text((tx, ty), tag, font=tf, fill=DIM)

# bottom accent gradient line
for px in range(LW):
    t = px/(LW-1)
    c = lerp(INDIGO, CYAN, t)
    for off, alpha in [(0, 0.5), (1, 0.2)]:
        bg = logo.getpixel((px, LH-3+off))
        logo.putpixel((px, LH-3+off), lerp(bg, c, alpha))

logo.save(os.path.join(OUTPUT_DIR, "logo.png"), "PNG")
print("logo.png saved")
