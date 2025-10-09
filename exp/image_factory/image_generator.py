# pip install pillow
from PIL import Image, ImageDraw, ImageChops, ImageFilter
import math, os

def hex_rgba(s: str, default_alpha: int = 255):
    """
    '#RGB' '#RGBA' '#RRGGBB' '#RRGGBBAA' または 'RRGGBB' / 'RRGGBBAA' に対応．
    先頭の '#' や '0x' はあってもなくても可．
    """
    s = s.strip().lower()
    if s.startswith("0x"):
        s = s[2:]
    if s.startswith("#"):
        s = s[1:]
    n = len(s)
    if n == 3:   # RGB
        r, g, b = (int(c*2, 16) for c in s)
        a = default_alpha
    elif n == 4: # RGBA
        r, g, b, a = (int(c*2, 16) for c in s)
    elif n == 6: # RRGGBB
        r = int(s[0:2], 16); g = int(s[2:4], 16); b = int(s[4:6], 16); a = default_alpha
    elif n == 8: # RRGGBBAA
        r = int(s[0:2], 16); g = int(s[2:4], 16); b = int(s[4:6], 16); a = int(s[6:8], 16)
    else:
        raise ValueError(f"invalid hex color: {s}")
    return (r, g, b, a)

# ===== 保存先 =====
OUTPUT_DIR = "images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ===== 共通パラメータ =====
SIZE = 512
CANVAS_BG = (0, 0, 0, 0)          # 透過キャンバス
PAT_BG    = (255, 255, 255, 255)  # 模様の“白地”
BORDER_WIDTH = 40                 # 枠の太さ（リング幅）
DOT_COLOR = (0, 0, 0, 255)        # 模様（黒）
LINE_COLOR = (0, 0, 0, 255)       # 線系（黒）
CHK_COLOR = (0, 0, 0, 255)        # 市松の黒

# 枠線の色（8色）
colors_hex = {
    "org": "#D55E00",
    "yel": "#E69F00",
    "lmn": "#F0E442",
    "ind": "#2E3C9D",
    "trq": "#56B4E9",
    "blu": "#0072B2",
    "grn": "#009E73",
    "pnk": "#CC79A7",
}
colors = {name: hex_rgba(hexcode) for name, hexcode in colors_hex.items()}

# ===== 基本ユーティリティ =====
def create_base():
    img = Image.new("RGBA", (SIZE, SIZE), CANVAS_BG)  # 透過
    return img, ImageDraw.Draw(img)

def draw_border_rect(draw, color):
    draw.rectangle([0, 0, SIZE - 1, SIZE - 1], outline=color, width=BORDER_WIDTH)

def draw_border_circle(draw, color):
    w = BORDER_WIDTH
    bbox = [w // 2, w // 2, SIZE - 1 - w // 2, SIZE - 1 - w // 2]
    draw.ellipse(bbox, outline=color, width=w)

def draw_border_triangle(draw, color, pts_outer):
    w = BORDER_WIDTH
    # 頂点欠け防止の微オフセット（1px 内側）
    cx = sum(x for x, _ in pts_outer) / 3.0
    cy = sum(y for _, y in pts_outer) / 3.0
    pts = []
    for x, y in pts_outer:
        vx, vy = x - cx, y - cy
        r = (vx * vx + vy * vy) ** 0.5 or 1.0
        pts.append((int(round(x - vx / r)), int(round(y - vy / r))))
    try:
        draw.polygon(pts, outline=color, width=w)
    except TypeError:
        draw.line(pts + [pts[0]], fill=color, width=w)

def draw_border_regular_polygon(draw, color, pts_outer):
    """正多角形（pnt/hex/oct）の枠線を描画（1px 内側に寄せて安全）"""
    w = BORDER_WIDTH
    cx = sum(x for x, _ in pts_outer) / len(pts_outer)
    cy = sum(y for _, y in pts_outer) / len(pts_outer)
    pts = []
    for x, y in pts_outer:
        vx, vy = x - cx, y - cy
        r = (vx * vx + vy * vy) ** 0.5 or 1.0
        pts.append((int(round(x - vx / r)), int(round(y - vy / r))))
    try:
        draw.polygon(pts, outline=color, width=w)
    except TypeError:
        draw.line(pts + [pts[0]], fill=color, width=w)

# ===== 模様描画 =====
def draw_dots(draw, step=48, r=6):
    for y in range(step // 2, SIZE, step):
        for x in range(step // 2, SIZE, step):
            draw.ellipse([x - r, y - r, x + r, y + r], fill=DOT_COLOR)

def draw_vertical_stripes(draw, stripe_width=20):
    for x in range(0, SIZE, stripe_width * 2):
        draw.rectangle([x, 0, x + stripe_width, SIZE], fill=LINE_COLOR)

def draw_grid(draw, step=64, width=5):
    for i in range(0, SIZE, step):
        draw.line([(i, 0), (i, SIZE)], fill=LINE_COLOR, width=width)
        draw.line([(0, i), (SIZE, i)], fill=LINE_COLOR, width=width)

def draw_diag_stripes(draw, step=40, width=10, kind="sla"):
    if kind == "sla":  # ／
        for t in range(-SIZE, SIZE, step):
            draw.line([(t, SIZE), (t + SIZE, 0)], fill=LINE_COLOR, width=width)
    else:              # ＼
        for t in range(-SIZE, SIZE, step):
            draw.line([(t, 0), (t + SIZE, SIZE)], fill=LINE_COLOR, width=width)

def draw_checker_vh(draw, cell=48):
    for y in range(0, SIZE, cell):
        for x in range(0, SIZE, cell):
            if ((x // cell) + (y // cell)) % 2 == 0:
                draw.rectangle([x, y, min(x + cell, SIZE), min(y + cell, SIZE)], fill=CHK_COLOR)

def draw_checker_diag_fill(img, cell=48):
    need = int(math.ceil(SIZE * math.sqrt(2))) + cell * 4
    pat = Image.new("RGBA", (need, need), PAT_BG)
    pd = ImageDraw.Draw(pat)
    for y in range(0, need, cell):
        for x in range(0, need, cell):
            if ((x // cell) + (y // cell)) % 2 == 0:
                pd.rectangle([x, y, min(x + cell, need), min(y + cell, need)], fill=CHK_COLOR)
    pat_rot = pat.rotate(45, resample=Image.NEAREST, expand=True, fillcolor=PAT_BG)
    w, h = pat_rot.size
    left = (w - SIZE) // 2
    top  = (h - SIZE) // 2
    img.paste(pat_rot.crop((left, top, left + SIZE, top + SIZE)), (0, 0))

def draw_diag_grid(draw, step=64, width=5):
    """斜めのグリッド（／と＼のクロス）"""
    for t in range(-SIZE, SIZE + 1, step):
        draw.line([(t, SIZE), (t + SIZE, 0)], fill=LINE_COLOR, width=width)
        draw.line([(t, 0), (t + SIZE, SIZE)], fill=LINE_COLOR, width=width)

# ===== マスク生成（四角・円・三角・＋・正多角形）=====
def rect_inner_mask():
    pad = BORDER_WIDTH // 2 + 1
    m = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(m).rectangle([pad, pad, SIZE - 1 - pad, SIZE - 1 - pad], fill=255)
    return m

def circle_mask():
    m = Image.new("L", (SIZE, SIZE), 0)
    w = BORDER_WIDTH
    bbox = [w // 2, w // 2, SIZE - 1 - w // 2, SIZE - 1 - w // 2]
    ImageDraw.Draw(m).ellipse(bbox, fill=255)
    return m

def triangle_inner_mask():
    w = BORDER_WIDTH
    base = SIZE - w
    h = int(base * math.sqrt(3) / 2)
    pts_outer = [
        (SIZE // 2, w // 2),
        (w // 2, w // 2 + h),
        (SIZE - w // 2, w // 2 + h),
    ]
    d_in = BORDER_WIDTH / 2.0 + 1.0
    k = max(0.0, 1.0 - 3.0 * d_in / float(h))
    cx = sum(p[0] for p in pts_outer) / 3.0
    cy = sum(p[1] for p in pts_outer) / 3.0
    pts_inner = []
    for x, y in pts_outer:
        nx = cx + k * (x - cx)
        ny = cy + k * (y - cy)
        pts_inner.append((int(round(nx)), int(round(ny))))
    m = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(m).polygon(pts_inner, fill=255)
    return m, pts_outer  # （内側マスク，枠用外形）

def regular_polygon_points(n, radius, rotation_deg=-90.0):
    """中心原点で角度 rotation_deg（-90°=上向き頂点）から始まる正多角形の頂点列」
    """
    cx = cy = SIZE / 2.0
    rad = math.radians(rotation_deg)
    pts = []
    for k in range(n):
        a = rad + 2.0 * math.pi * k / n
        x = cx + radius * math.cos(a)
        y = cy + radius * math.sin(a)
        pts.append((int(round(x)), int(round(y))))
    return pts

def polygon_inner_mask(n):
    """
    正n角形の（内側マスク，外形頂点）を返す．
    外形半径 R_out は枠が欠けないように SIZE/2 - BORDER_WIDTH/2 - 2．
    内側は R_in = R_out - (BORDER_WIDTH/2 + 1) で縮小．
    """
    R_out = SIZE / 2.0 - BORDER_WIDTH / 2.0 - 2.0
    R_in  = max(1.0, R_out - (BORDER_WIDTH / 2.0 + 1.0))

    pts_outer = regular_polygon_points(n, R_out, rotation_deg=-90.0)
    pts_inner = regular_polygon_points(n, R_in,  rotation_deg=-90.0)

    m = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(m).polygon(pts_inner, fill=255)
    return m, pts_outer

def inset_square_mask():
    pad = BORDER_WIDTH // 2
    m = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(m).rectangle([pad, pad, SIZE - 1 - pad, SIZE - 1 - pad], fill=255)
    return m

def plus_masks(arm_outer: int):
    """＋形の（内形／外形）マスクを返す（内形は MinFilter で収縮）"""
    m_out = Image.new("L", (SIZE, SIZE), 0)
    d = ImageDraw.Draw(m_out)
    top = (SIZE - arm_outer) // 2
    bot = top + arm_outer
    lef = (SIZE - arm_outer) // 2
    rig = lef + arm_outer
    d.rectangle([0,   top, SIZE, bot], fill=255)  # 横棒
    d.rectangle([lef, 0,   rig,  SIZE], fill=255) # 縦棒
    m_out = ImageChops.multiply(m_out, inset_square_mask())
    k = max(1, 2 * BORDER_WIDTH + 1)  # 収縮カーネル（奇数）
    m_in = m_out.filter(ImageFilter.MinFilter(k))
    m_out = m_out.point(lambda v: 255 if v >= 128 else 0, mode="L")
    m_in  = m_in.point(lambda v: 255 if v >= 128 else 0, mode="L")
    return m_in, m_out

def plus_border_paste(base_img, color, mask_out, mask_in):
    alpha = ImageChops.subtract(mask_out, mask_in)
    border_layer = Image.new("RGBA", (SIZE, SIZE), color)
    base_img.paste(border_layer, (0, 0), alpha)

# === 追加：2値マスクを高品質に回転して再2値化 ===
def rotate_bin_mask(m: Image.Image, angle_deg: float) -> Image.Image:
    # アンチエイリアスを効かせて回転し，最後にしきい値で2値化（0/255）．
    r = m.rotate(angle_deg, resample=Image.BILINEAR, expand=False, fillcolor=0)
    r = r.point(lambda v: 255 if v >= 128 else 0, mode="L")
    return r

# ===== レイヤ生成（模様）=====
def render_pattern_layer_by_key(key: str) -> Image.Image:
    layer = Image.new("RGBA", (SIZE, SIZE), PAT_BG)  # 模様レイヤは白地
    d = ImageDraw.Draw(layer)
    if key == "dot":
        draw_dots(d)
    elif key == "str":
        draw_vertical_stripes(d)
    elif key == "grd":
        draw_grid(d)
    elif key == "sla":
        draw_diag_stripes(d, kind="sla")
    elif key == "bsl":
        draw_diag_stripes(d, kind="bsl")
    elif key == "chk":
        draw_checker_vh(d)
    elif key == "dch":
        draw_checker_diag_fill(layer)
    elif key == "dgr":
        draw_diag_grid(d)
    else:
        raise ValueError(f"unknown pattern: {key}")
    return layer

# ===== 形状別ペースト・枠線 =====
def paste_by_shape(base, layer, shape, masks, pctx):
    rect_m, cir_m, tri_m = masks["rect"], masks["cir"], masks["tri"]
    if shape == "squ":
        base.paste(layer, (0, 0), rect_m)
    elif shape == "cir":
        base.paste(layer, (0, 0), cir_m)
    elif shape == "tri":
        base.paste(layer, (0, 0), tri_m[0])  # tri_m=(mask, pts)
    elif shape == "pbd":
        base.paste(layer, (0, 0), pctx["pbd"]["mask_in"])
    elif shape == "plt":
        base.paste(layer, (0, 0), pctx["plt"]["mask_in"])
    elif shape == "xbd":   # 太い×（旧pbdx）
        base.paste(layer, (0, 0), pctx["xbd"]["mask_in"])
    elif shape == "xlt":   # 細い×（旧pltx）
        base.paste(layer, (0, 0), pctx["xlt"]["mask_in"])
    elif shape in ("pnt", "hex", "oct"):
        base.paste(layer, (0, 0), masks[shape][0])  # 内側マスク
    else:
        raise ValueError(f"unknown shape: {shape}")

def draw_border_by_shape(img, color, shape, masks, pctx):
    d = ImageDraw.Draw(img)
    if shape == "squ":
        draw_border_rect(d, color)
    elif shape == "cir":
        draw_border_circle(d, color)
    elif shape == "tri":
        draw_border_triangle(d, color, masks["tri"][1])
    elif shape == "pbd":
        plus_border_paste(img, color, pctx["pbd"]["mask_out"], pctx["pbd"]["mask_in"])
    elif shape == "plt":
        plus_border_paste(img, color, pctx["plt"]["mask_out"], pctx["plt"]["mask_in"])
    elif shape == "xbd":   # 太い×
        plus_border_paste(img, color, pctx["xbd"]["mask_out"], pctx["xbd"]["mask_in"])
    elif shape == "xlt":   # 細い×
        plus_border_paste(img, color, pctx["xlt"]["mask_out"], pctx["xlt"]["mask_in"])
    elif shape in ("pnt", "hex", "oct"):
        draw_border_regular_polygon(d, color, masks[shape][1])
    else:
        raise ValueError(f"unknown shape: {shape}")

# ===== メイン =====
masks = {
    "rect": rect_inner_mask(),
    "cir":  circle_mask(),
    "tri":  triangle_inner_mask(),   # (mask, pts_outer)
    "pnt":  polygon_inner_mask(5),   # (mask, pts_outer)
    "hex":  polygon_inner_mask(6),
    "oct":  polygon_inner_mask(8),
}

# ＋形の外側太さ（SIZE に比例して調整可能）
PLUS_OUT_THICK = int(SIZE * 0.50)  # pbd：太い
PLUS_OUT_THIN  = int(SIZE * 0.25)  # plt：細い

# ＋形マスク
PCTX = {
    "pbd": {
        "mask_in":  plus_masks(PLUS_OUT_THICK)[0],
        "mask_out": plus_masks(PLUS_OUT_THICK)[1],
    },
    "plt": {
        "mask_in":  plus_masks(PLUS_OUT_THIN)[0],
        "mask_out": plus_masks(PLUS_OUT_THIN)[1],
    },
}

# 追加：＋を45度回した「×」版を登録（pbd→xbd，plt→xlt）
PCTX["xbd"] = {
    "mask_in":  rotate_bin_mask(PCTX["pbd"]["mask_in"], 45),
    "mask_out": rotate_bin_mask(PCTX["pbd"]["mask_out"], 45),
}
PCTX["xlt"] = {
    "mask_in":  rotate_bin_mask(PCTX["plt"]["mask_in"], 45),
    "mask_out": rotate_bin_mask(PCTX["plt"]["mask_out"], 45),
}

# パターン一覧
patterns = ["dot", "str", "grd", "sla", "bsl", "chk", "dch", "dgr"]
# 形状一覧（×を xbd，xlt に）
shapes   = ["squ", "cir", "tri", "pbd", "plt", "xbd", "xlt", "pnt", "hex", "oct"]

for cname, border_col in colors.items():
    for shape in shapes:
        for pat in patterns:
            base, _ = create_base()
            layer = render_pattern_layer_by_key(pat)
            paste_by_shape(base, layer, shape, masks, PCTX)
            draw_border_by_shape(base, border_col, shape, masks, PCTX)
            base.save(os.path.join(OUTPUT_DIR, f"{cname}_{pat}_{shape}.png"), "PNG")

print("✅ 透明背景で 8色×8模様×10形状（squ，cir，tri，pbd，plt，xbd，xlt，pnt，hex，oct）を保存しました．")
