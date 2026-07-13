# pip install pillow
from PIL import Image, ImageDraw, ImageChops, ImageFilter
import math, os

def hex_rgba(s: str, default_alpha: int = 255):
    """
    '#RGB' '#RGBA' '#RRGGBB' '#RRGGBBAA'
    または
    'RRGGBB' / 'RRGGBBAA'
    に対応．
    """
    s = s.strip().lower()

    if s.startswith("0x"):
        s = s[2:]

    if s.startswith("#"):
        s = s[1:]

    n = len(s)

    if n == 3:
        r, g, b = (int(c * 2, 16) for c in s)
        a = default_alpha

    elif n == 4:
        r, g, b, a = (int(c * 2, 16) for c in s)

    elif n == 6:
        r = int(s[0:2], 16)
        g = int(s[2:4], 16)
        b = int(s[4:6], 16)
        a = default_alpha

    elif n == 8:
        r = int(s[0:2], 16)
        g = int(s[2:4], 16)
        b = int(s[4:6], 16)
        a = int(s[6:8], 16)

    else:
        raise ValueError(f"invalid hex color: {s}")

    return (r, g, b, a)


# =========================================================
# 保存先
# =========================================================

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "images")
os.makedirs(OUTPUT_DIR, exist_ok=True)


# =========================================================
# 共通パラメータ
# =========================================================

SIZE = 512

CANVAS_BG = (0, 0, 0, 0)          # 透明背景
PAT_BG    = (255, 255, 255, 255)  # 模様背景

BORDER_WIDTH = 40

# 図形ごとの追加余白．
# 完成画像をHTML側で拡大縮小すると模様の細かさも変わってしまうため，
# 画像生成時点で図形そのものの大きさを調整する．
SHAPE_PAD = {
    "squ": 44,
    "cir": 20,
    "tri": 0,
    "pnt": 8,
    "hex": 12,
    "oct": 12,
    "pbd": 20,
    "plt": 20,
    "xbd": 20,
    "xlt": 20,
}

def get_shape_pad(shape: str) -> int:
    return SHAPE_PAD.get(shape, 0)

DOT_COLOR  = (0, 0, 0, 255)
LINE_COLOR = (0, 0, 0, 255)
CHK_COLOR  = (0, 0, 0, 255)


# =========================================================
# 生成対象（←ここで指定）
# =========================================================

patterns = [
    "gst",  # 通常ストライプ（縦縞）
    "dst",  # 斜めストライプ
    "vgr",  # 縦横グリッド
    "dgr",  # 斜めグリッド
    "vch",  # 縦横チェック
    "dch",  # 斜めチェック
    "gdt",  # 格子点ドット
    "ddt",  # 斜め配置ドット
]

shapes = [
    "cir",  # 円
    "tri",  # 三角形
    "squ",  # 四角形
    "pnt",  # 五角形
]


# =========================================================
# 色定義
# =========================================================

colors_hex = {
    # Pale colors（従来の4色）
    # 名前は p + 色名2字の3文字で統一する．
    "ppn": "#CC79A7",  # pale pink
    "pyl": "#E69F00",  # pale yellow
    "pgn": "#009E73",  # pale green
    "pbl": "#0072B2",  # pale blue

    # Vivid colors
    # 名前は v + 色名2字の3文字で統一する．
    "vpn": "#FF33FF",  # vivid pink
    "vyl": "#FFFF00",  # vivid yellow
    "vgn": "#00FF00",  # vivid green
    "vbl": "#0066FF",  # vivid blue
}

colors = {
    name: hex_rgba(code)
    for name, code in colors_hex.items()
}


# =========================================================
# 基本ユーティリティ
# =========================================================

def create_base():
    img = Image.new("RGBA", (SIZE, SIZE), CANVAS_BG)
    return img, ImageDraw.Draw(img)


def draw_border_rect(draw, color, shape="squ"):

    extra = get_shape_pad(shape)

    draw.rectangle(
        [extra, extra, SIZE - 1 - extra, SIZE - 1 - extra],
        outline=color,
        width=BORDER_WIDTH
    )


def draw_border_circle(draw, color, shape="cir"):

    w = BORDER_WIDTH
    extra = get_shape_pad(shape)

    bbox = [
        extra + w // 2,
        extra + w // 2,
        SIZE - 1 - extra - w // 2,
        SIZE - 1 - extra - w // 2
    ]

    draw.ellipse(
        bbox,
        outline=color,
        width=w
    )


def draw_border_triangle(draw, color, pts_outer):

    w = BORDER_WIDTH

    cx = sum(x for x, _ in pts_outer) / 3.0
    cy = sum(y for _, y in pts_outer) / 3.0

    pts = []

    for x, y in pts_outer:

        vx = x - cx
        vy = y - cy

        r = (vx * vx + vy * vy) ** 0.5 or 1.0

        pts.append((
            int(round(x - vx / r)),
            int(round(y - vy / r))
        ))

    draw.polygon(
        pts,
        outline=color,
        width=w
    )


def draw_border_regular_polygon(draw, color, pts_outer):

    w = BORDER_WIDTH

    cx = sum(x for x, _ in pts_outer) / len(pts_outer)
    cy = sum(y for _, y in pts_outer) / len(pts_outer)

    pts = []

    for x, y in pts_outer:

        vx = x - cx
        vy = y - cy

        r = (vx * vx + vy * vy) ** 0.5 or 1.0

        pts.append((
            int(round(x - vx / r)),
            int(round(y - vy / r))
        ))

    draw.polygon(
        pts,
        outline=color,
        width=w
    )


# =========================================================
# 模様描画
# =========================================================

def draw_dots(draw, step=64, r=8, staggered=False):
    """ドットを格子状または1行おきに半ピッチずらして描画する．"""
    row = 0

    for y in range(step // 2, SIZE, step):
        x_offset = step // 2 if staggered and row % 2 == 1 else 0

        for x in range(step // 2 + x_offset, SIZE, step):
            draw.ellipse(
                [x - r, y - r, x + r, y + r],
                fill=DOT_COLOR
            )

        row += 1

def draw_vertical_stripes(draw, stripe_width=20):

    for x in range(0, SIZE, stripe_width * 2):

        draw.rectangle(
            [x, 0, x + stripe_width, SIZE],
            fill=LINE_COLOR
        )



def draw_grid(draw, step=64, width=5):

    for i in range(0, SIZE, step):

        draw.line(
            [(i, 0), (i, SIZE)],
            fill=LINE_COLOR,
            width=width
        )

        draw.line(
            [(0, i), (SIZE, i)],
            fill=LINE_COLOR,
            width=width
        )


def draw_diag_stripes(draw, step=40, width=10, kind="sla"):

    if kind == "sla":

        for t in range(-SIZE, SIZE, step):

            draw.line(
                [(t, SIZE), (t + SIZE, 0)],
                fill=LINE_COLOR,
                width=width
            )

    else:

        for t in range(-SIZE, SIZE, step):

            draw.line(
                [(t, 0), (t + SIZE, SIZE)],
                fill=LINE_COLOR,
                width=width
            )


def draw_checker_vh(draw, cell=48):

    for y in range(0, SIZE, cell):

        for x in range(0, SIZE, cell):

            if ((x // cell) + (y // cell)) % 2 == 0:

                draw.rectangle(
                    [
                        x,
                        y,
                        min(x + cell, SIZE),
                        min(y + cell, SIZE)
                    ],
                    fill=CHK_COLOR
                )


def draw_checker_diag_fill(img, cell=48):

    need = int(math.ceil(SIZE * math.sqrt(2))) + cell * 4

    pat = Image.new("RGBA", (need, need), PAT_BG)

    pd = ImageDraw.Draw(pat)

    for y in range(0, need, cell):

        for x in range(0, need, cell):

            if ((x // cell) + (y // cell)) % 2 == 0:

                pd.rectangle(
                    [
                        x,
                        y,
                        min(x + cell, need),
                        min(y + cell, need)
                    ],
                    fill=CHK_COLOR
                )

    pat_rot = pat.rotate(
        45,
        resample=Image.NEAREST,
        expand=True,
        fillcolor=PAT_BG
    )

    w, h = pat_rot.size

    left = (w - SIZE) // 2
    top  = (h - SIZE) // 2

    img.paste(
        pat_rot.crop((left, top, left + SIZE, top + SIZE)),
        (0, 0)
    )


def draw_diag_grid(draw, step=64, width=5):

    for t in range(-SIZE, SIZE + 1, step):

        draw.line(
            [(t, SIZE), (t + SIZE, 0)],
            fill=LINE_COLOR,
            width=width
        )

        draw.line(
            [(t, 0), (t + SIZE, SIZE)],
            fill=LINE_COLOR,
            width=width
        )


# =========================================================
# マスク生成
# =========================================================

def rect_inner_mask(shape="squ"):

    extra = get_shape_pad(shape)
    pad = BORDER_WIDTH // 2 + 1 + extra

    m = Image.new("L", (SIZE, SIZE), 0)

    ImageDraw.Draw(m).rectangle(
        [pad, pad, SIZE - 1 - pad, SIZE - 1 - pad],
        fill=255
    )

    return m


def circle_mask(shape="cir"):

    m = Image.new("L", (SIZE, SIZE), 0)

    w = BORDER_WIDTH
    extra = get_shape_pad(shape)

    bbox = [
        extra + w // 2,
        extra + w // 2,
        SIZE - 1 - extra - w // 2,
        SIZE - 1 - extra - w // 2
    ]

    ImageDraw.Draw(m).ellipse(
        bbox,
        fill=255
    )

    return m


def triangle_inner_mask(shape="tri"):

    w = BORDER_WIDTH
    extra = get_shape_pad(shape)

    base = SIZE - 2 * extra - w
    h = int(base * math.sqrt(3) / 2)

    left = extra + w // 2
    right = SIZE - extra - w // 2
    top = int(round((SIZE - h) / 2))

    pts_outer = [
        (SIZE // 2, top),
        (left, top + h),
        (right, top + h),
    ]

    d_in = BORDER_WIDTH / 2.0 + 1.0

    k = max(0.0, 1.0 - 3.0 * d_in / float(h))

    cx = sum(p[0] for p in pts_outer) / 3.0
    cy = sum(p[1] for p in pts_outer) / 3.0

    pts_inner = []

    for x, y in pts_outer:

        nx = cx + k * (x - cx)
        ny = cy + k * (y - cy)

        pts_inner.append((
            int(round(nx)),
            int(round(ny))
        ))

    m = Image.new("L", (SIZE, SIZE), 0)

    ImageDraw.Draw(m).polygon(
        pts_inner,
        fill=255
    )

    return m, pts_outer


def regular_polygon_points(n, radius, rotation_deg=-90.0):

    cx = cy = SIZE / 2.0

    rad = math.radians(rotation_deg)

    pts = []

    for k in range(n):

        a = rad + 2.0 * math.pi * k / n

        x = cx + radius * math.cos(a)
        y = cy + radius * math.sin(a)

        pts.append((
            int(round(x)),
            int(round(y))
        ))

    return pts


def polygon_inner_mask(n, shape="pnt"):

    extra = get_shape_pad(shape)

    R_out = SIZE / 2.0 - BORDER_WIDTH / 2.0 - 2.0 - extra

    R_in = max(
        1.0,
        R_out - (BORDER_WIDTH / 2.0 + 1.0)
    )

    pts_outer = regular_polygon_points(n, R_out)
    pts_inner = regular_polygon_points(n, R_in)

    m = Image.new("L", (SIZE, SIZE), 0)

    ImageDraw.Draw(m).polygon(
        pts_inner,
        fill=255
    )

    return m, pts_outer


def inset_square_mask():

    pad = BORDER_WIDTH // 2

    m = Image.new("L", (SIZE, SIZE), 0)

    ImageDraw.Draw(m).rectangle(
        [pad, pad, SIZE - 1 - pad, SIZE - 1 - pad],
        fill=255
    )

    return m


def plus_masks(arm_outer: int):

    m_out = Image.new("L", (SIZE, SIZE), 0)

    d = ImageDraw.Draw(m_out)

    top = (SIZE - arm_outer) // 2
    bot = top + arm_outer

    lef = (SIZE - arm_outer) // 2
    rig = lef + arm_outer

    d.rectangle([0, top, SIZE, bot], fill=255)
    d.rectangle([lef, 0, rig, SIZE], fill=255)

    m_out = ImageChops.multiply(
        m_out,
        inset_square_mask()
    )

    k = max(1, 2 * BORDER_WIDTH + 1)

    m_in = m_out.filter(
        ImageFilter.MinFilter(k)
    )

    m_out = m_out.point(
        lambda v: 255 if v >= 128 else 0,
        mode="L"
    )

    m_in = m_in.point(
        lambda v: 255 if v >= 128 else 0,
        mode="L"
    )

    return m_in, m_out


def plus_border_paste(base_img, color, mask_out, mask_in):

    alpha = ImageChops.subtract(mask_out, mask_in)

    border_layer = Image.new(
        "RGBA",
        (SIZE, SIZE),
        color
    )

    base_img.paste(
        border_layer,
        (0, 0),
        alpha
    )


def rotate_bin_mask(m: Image.Image, angle_deg: float):

    r = m.rotate(
        angle_deg,
        resample=Image.BILINEAR,
        expand=False,
        fillcolor=0
    )

    r = r.point(
        lambda v: 255 if v >= 128 else 0,
        mode="L"
    )

    return r


# =========================================================
# 模様レイヤ生成
# =========================================================

def render_pattern_layer_by_key(key: str):

    layer = Image.new(
        "RGBA",
        (SIZE, SIZE),
        PAT_BG
    )

    d = ImageDraw.Draw(layer)

    if key == "gst":
        draw_vertical_stripes(d, stripe_width=20)

    elif key == "dst":
        draw_diag_stripes(d, step=40, width=20, kind="sla")

    elif key == "vgr":
        draw_grid(d, step=64, width=6)

    elif key == "dgr":
        draw_diag_grid(d, step=64, width=6)

    elif key == "vch":
        draw_checker_vh(d, cell=64)

    elif key == "dch":
        draw_checker_diag_fill(layer, cell=64)

    elif key == "gdt":
        draw_dots(d, step=64, r=9, staggered=False)

    elif key == "ddt":
        draw_dots(d, step=64, r=9, staggered=True)

    else:
        raise ValueError(f"unknown pattern: {key}")

    return layer

# =========================================================
# 図形別描画
# =========================================================

def paste_by_shape(base, layer, shape, masks, pctx):

    rect_m = masks["rect"]
    cir_m  = masks["cir"]
    tri_m  = masks["tri"]

    if shape == "squ":
        base.paste(layer, (0, 0), rect_m)

    elif shape == "cir":
        base.paste(layer, (0, 0), cir_m)

    elif shape == "tri":
        base.paste(layer, (0, 0), tri_m[0])

    elif shape == "pbd":
        base.paste(layer, (0, 0), pctx["pbd"]["mask_in"])

    elif shape == "plt":
        base.paste(layer, (0, 0), pctx["plt"]["mask_in"])

    elif shape == "xbd":
        base.paste(layer, (0, 0), pctx["xbd"]["mask_in"])

    elif shape == "xlt":
        base.paste(layer, (0, 0), pctx["xlt"]["mask_in"])

    elif shape in ("pnt", "hex", "oct"):
        base.paste(layer, (0, 0), masks[shape][0])

    else:
        raise ValueError(f"unknown shape: {shape}")


def draw_border_by_shape(img, color, shape, masks, pctx):

    d = ImageDraw.Draw(img)

    if shape == "squ":
        draw_border_rect(d, color, shape)

    elif shape == "cir":
        draw_border_circle(d, color, shape)

    elif shape == "tri":
        draw_border_triangle(d, color, masks["tri"][1])

    elif shape == "pbd":

        plus_border_paste(
            img,
            color,
            pctx["pbd"]["mask_out"],
            pctx["pbd"]["mask_in"]
        )

    elif shape == "plt":

        plus_border_paste(
            img,
            color,
            pctx["plt"]["mask_out"],
            pctx["plt"]["mask_in"]
        )

    elif shape == "xbd":

        plus_border_paste(
            img,
            color,
            pctx["xbd"]["mask_out"],
            pctx["xbd"]["mask_in"]
        )

    elif shape == "xlt":

        plus_border_paste(
            img,
            color,
            pctx["xlt"]["mask_out"],
            pctx["xlt"]["mask_in"]
        )

    elif shape in ("pnt", "hex", "oct"):

        draw_border_regular_polygon(
            d,
            color,
            masks[shape][1]
        )

    else:
        raise ValueError(f"unknown shape: {shape}")


# =========================================================
# マスク準備
# =========================================================

masks = {

    "rect": rect_inner_mask("squ"),

    "cir": circle_mask("cir"),

    "tri": triangle_inner_mask("tri"),

    "pnt": polygon_inner_mask(5, "pnt"),

    "hex": polygon_inner_mask(6, "hex"),

    "oct": polygon_inner_mask(8, "oct"),
}


PLUS_OUT_THICK = int(SIZE * 0.50)
PLUS_OUT_THIN  = int(SIZE * 0.25)


PCTX = {

    "pbd": {
        "mask_in": plus_masks(PLUS_OUT_THICK)[0],
        "mask_out": plus_masks(PLUS_OUT_THICK)[1],
    },

    "plt": {
        "mask_in": plus_masks(PLUS_OUT_THIN)[0],
        "mask_out": plus_masks(PLUS_OUT_THIN)[1],
    },
}


PCTX["xbd"] = {

    "mask_in": rotate_bin_mask(
        PCTX["pbd"]["mask_in"],
        45
    ),

    "mask_out": rotate_bin_mask(
        PCTX["pbd"]["mask_out"],
        45
    ),
}


PCTX["xlt"] = {

    "mask_in": rotate_bin_mask(
        PCTX["plt"]["mask_in"],
        45
    ),

    "mask_out": rotate_bin_mask(
        PCTX["plt"]["mask_out"],
        45
    ),
}


# =========================================================
# 画像生成
# =========================================================

generated_count = 0

for cname, border_col in colors.items():

    for shape in shapes:

        for pat in patterns:

            base, _ = create_base()

            layer = render_pattern_layer_by_key(pat)

            paste_by_shape(
                base,
                layer,
                shape,
                masks,
                PCTX
            )

            draw_border_by_shape(
                base,
                border_col,
                shape,
                masks,
                PCTX
            )

            filename = f"{cname}_{pat}_{shape}.png"

            base.save(
                os.path.join(OUTPUT_DIR, filename),
                "PNG"
            )

            generated_count += 1

expected_count = len(colors) * len(shapes) * len(patterns)
assert generated_count == expected_count
print(f"completed: {generated_count} images -> {OUTPUT_DIR}")