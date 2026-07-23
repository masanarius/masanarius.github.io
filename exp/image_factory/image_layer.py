from pathlib import Path

from PIL import Image, ImageChops, ImageDraw


# ============================================================
# 設定
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
ASSETS_DIR = BASE_DIR / "assets"
OUTPUT_DIR = BASE_DIR / "images"

# 出力ファイル名：
#   色名_背景名_図形名.png
#
# 例：
#   vpn_dot_circle.png
#
# 色名は以下の規則：
#   p = pale
#   v = vivid
#   pn = pink
#   yl = yellow
#   gn = green
#   bl = blue
COLORS = {
    # Set A
    #"ppn": "#CC79A7",
    "pyl": "#E69F00",
    "pgn": "#009E73",
    "pbl": "#0072B2",

    # Set B
    #"vpn": "#E05AA8",
    "vyl": "#F2C300",
    "vgn": "#00B884",
    "vbl": "#356FD4",
}

# 画像サイズが異なる場合，背景画像のサイズへ自動的に合わせる
AUTO_RESIZE = True

# Trueの場合，既存画像も上書きする
OVERWRITE = True

# 黒枠
BORDER_WIDTH = 100
BORDER_COLOR = (0, 0, 0)


# ============================================================
# 基本処理
# ============================================================

def parse_color(color: str | tuple[int, int, int]) -> tuple[int, int, int]:
    """色指定をRGBタプルへ変換する．"""
    if isinstance(color, tuple):
        if len(color) != 3:
            raise ValueError("RGBタプルは3要素で指定してください．")

        if not all(0 <= value <= 255 for value in color):
            raise ValueError("RGB値は0～255で指定してください．")

        return color

    value = color.strip().lstrip("#")

    if len(value) != 6:
        raise ValueError(
            f"色は '#FF33FF' または 'FF33FF' の形式で指定してください：{color}"
        )

    try:
        return tuple(
            int(value[index:index + 2], 16)
            for index in (0, 2, 4)
        )
    except ValueError as exc:
        raise ValueError(
            f"無効な16進カラーコードです：{color}"
        ) from exc


def open_rgba(path: Path) -> Image.Image:
    """PNG画像をRGBA形式で読み込む．"""
    if not path.exists():
        raise FileNotFoundError(f"画像が見つかりません：{path}")

    with Image.open(path) as image:
        return image.convert("RGBA")


def fit_to_canvas(
    image: Image.Image,
    canvas_size: tuple[int, int],
    *,
    auto_resize: bool,
) -> Image.Image:
    """画像を背景キャンバスのサイズへ合わせる．"""
    if image.size == canvas_size:
        return image

    if not auto_resize:
        raise ValueError(
            f"画像サイズが一致しません：{image.size} != {canvas_size}"
        )

    return image.resize(
        canvas_size,
        Image.Resampling.LANCZOS,
    )


def recolor_white_image(
    image: Image.Image,
    color: str | tuple[int, int, int],
) -> Image.Image:
    """
    白色で描かれたPNGを指定色へ着色する．

    元画像の明度とアルファ値を利用するため，
    アンチエイリアス部分も維持される．
    """
    rgb = parse_color(color)

    original_alpha = image.getchannel("A")
    brightness = image.convert("L")

    effective_alpha = ImageChops.multiply(
        original_alpha,
        brightness,
    )

    colored = Image.new(
        "RGBA",
        image.size,
        (*rgb, 255),
    )
    colored.putalpha(effective_alpha)

    return colored


# ============================================================
# assetsの自動検出
# ============================================================

def find_backgrounds() -> dict[str, Path]:
    """
    assets内の「*_bg.png」をすべて検出する．

    例：
        dot_bg.png    -> dot
        stripe_bg.png -> stripe
    """
    backgrounds = {}

    for path in sorted(ASSETS_DIR.glob("*_bg.png")):
        name = path.stem.removesuffix("_bg")
        backgrounds[name] = path

    return backgrounds


def find_shapes() -> dict[str, tuple[Path, Path]]:
    """
    「図形名_die.png」と「図形名_frame.png」が
    両方そろっている図形を検出する．
    """
    die_files = {
        path.stem.removesuffix("_die"): path
        for path in ASSETS_DIR.glob("*_die.png")
    }

    frame_files = {
        path.stem.removesuffix("_frame"): path
        for path in ASSETS_DIR.glob("*_frame.png")
    }

    common_names = sorted(
        set(die_files) & set(frame_files)
    )

    shapes = {
        name: (
            die_files[name],
            frame_files[name],
        )
        for name in common_names
    }

    missing_frames = sorted(
        set(die_files) - set(frame_files)
    )
    missing_dies = sorted(
        set(frame_files) - set(die_files)
    )

    if missing_frames:
        print(
            "警告：対応するframeがないため除外："
            + ", ".join(missing_frames)
        )

    if missing_dies:
        print(
            "警告：対応するdieがないため除外："
            + ", ".join(missing_dies)
        )

    return shapes


# ============================================================
# 画像生成
# ============================================================

def generate_one(
    background_path: Path,
    die_path: Path,
    frame_path: Path,
    frame_color: str,
    output_path: Path,
) -> None:
    """背景・型抜き・着色フレームを合成して1枚保存する．"""
    background = open_rgba(background_path)

    if background.width != background.height:
        raise ValueError(
            f"背景画像は正方形である必要があります："
            f"{background_path.name} {background.size}"
        )

    canvas_size = background.size

    die = fit_to_canvas(
        open_rgba(die_path),
        canvas_size,
        auto_resize=AUTO_RESIZE,
    )

    frame = fit_to_canvas(
        open_rgba(frame_path),
        canvas_size,
        auto_resize=AUTO_RESIZE,
    )

    colored_frame = recolor_white_image(
        frame,
        frame_color,
    )

    # 合成順：
    # 1．背景
    # 2．型抜き画像
    # 3．指定色のフレーム
    result = Image.alpha_composite(
        background,
        die,
    )
    result = Image.alpha_composite(
        result,
        colored_frame,
    )

    draw = ImageDraw.Draw(result)
    for i in range(BORDER_WIDTH):
        draw.rectangle(
            (i, i, result.width - 1 - i, result.height - 1 - i),
            outline=BORDER_COLOR,
        )

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )
    result.save(output_path, "PNG")


def generate_all() -> None:
    """assetsから作成可能な全組合せを生成する．"""
    if not ASSETS_DIR.exists():
        raise FileNotFoundError(
            f"assetsフォルダが見つかりません：{ASSETS_DIR}"
        )

    backgrounds = find_backgrounds()
    shapes = find_shapes()

    if not backgrounds:
        raise RuntimeError(
            "assets内に「*_bg.png」がありません．"
        )

    if not shapes:
        raise RuntimeError(
            "対応する「*_die.png」と「*_frame.png」の組がありません．"
        )

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    total = (
        len(COLORS)
        * len(backgrounds)
        * len(shapes)
    )

    created = 0
    skipped = 0
    failed = 0

    print("検出結果")
    print(f"  背景：{len(backgrounds)}種類")
    print(f"    {', '.join(backgrounds)}")
    print(f"  図形：{len(shapes)}種類")
    print(f"    {', '.join(shapes)}")
    print(f"  色　：{len(COLORS)}種類")
    print(f"    {', '.join(COLORS)}")
    print(f"  合計：{total}枚")
    print()

    for color_name, color_code in COLORS.items():
        for background_name, background_path in backgrounds.items():
            for shape_name, paths in shapes.items():
                die_path, frame_path = paths

                output_name = (
                    f"{color_name}_"
                    f"{background_name}_"
                    f"{shape_name}.png"
                )
                output_path = OUTPUT_DIR / output_name

                if output_path.exists() and not OVERWRITE:
                    skipped += 1
                    continue

                try:
                    generate_one(
                        background_path=background_path,
                        die_path=die_path,
                        frame_path=frame_path,
                        frame_color=color_code,
                        output_path=output_path,
                    )
                    created += 1
                    print(
                        f"[{created + skipped + failed:03d}/{total:03d}] "
                        f"{output_name}"
                    )

                except Exception as exc:
                    failed += 1
                    print(
                        f"失敗：{output_name}：{exc}"
                    )

    print()
    print("生成完了")
    print(f"  作成　：{created}枚")
    print(f"  スキップ：{skipped}枚")
    print(f"  失敗　：{failed}枚")
    print(f"  出力先：{OUTPUT_DIR}")


def main() -> None:
    generate_all()


if __name__ == "__main__":
    main()
