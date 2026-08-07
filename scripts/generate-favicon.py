#!/usr/bin/env python3
"""Generate Human Weather 8-bar H favicon assets (IBM-inspired)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

GOLD = (241, 193, 77)  # #F1C14D
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
PUBLIC = Path(__file__).resolve().parents[1] / "public"


def rounded_rect_mask(size: int, radius: float) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def draw_eight_bar_h_float(
    draw: ImageDraw.ImageDraw,
    size: int,
    color: tuple[int, int, int],
    *,
    inset: float = 0.18,
) -> None:
    pad = size * inset
    inner = size - 2 * pad
    unit = inner / 15.0
    bar_h = unit
    step = unit * 2
    pillar_w = inner * 0.30
    left = pad
    right = pad + inner - pillar_w
    full_right = pad + inner
    cross = {3, 4}

    for i in range(8):
        y0 = pad + i * step
        y1 = y0 + bar_h
        if i in cross:
            draw.rectangle([left, y0, full_right, y1], fill=color)
        else:
            draw.rectangle([left, y0, left + pillar_w, y1], fill=color)
            draw.rectangle([right, y0, right + pillar_w, y1], fill=color)


def draw_eight_bar_h_pixel(
    draw: ImageDraw.ImageDraw,
    size: int,
    color: tuple[int, int, int],
) -> None:
    """
    Pixel-snapped 8-bar H for tiny favicons.
    unit = floor(size / 16) so we keep ≥1px outer margin on 16/32.
    """
    unit = max(1, size // 16)
    content = 15 * unit
    pad = (size - content) // 2
    pillar = max(unit * 4, int(round(content * 0.30 / unit) * unit))
    # Keep pillars odd-unit friendly
    if pillar % unit:
        pillar = (pillar // unit) * unit
    left = pad
    right = pad + content - pillar
    full_right = pad + content
    cross = {3, 4}

    for i in range(8):
        y0 = pad + i * 2 * unit
        y1 = y0 + unit - 1
        if i in cross:
            draw.rectangle([left, y0, full_right - 1, y1], fill=color)
        else:
            draw.rectangle([left, y0, left + pillar - 1, y1], fill=color)
            draw.rectangle([right, y0, right + pillar - 1, y1], fill=color)


def make_icon(
    size: int,
    *,
    bg: tuple[int, int, int],
    rounded: bool = False,
    radius_ratio: float = 0.22,
    inset: float = 0.18,
    pixel: bool | None = None,
) -> Image.Image:
    img = Image.new("RGBA", (size, size), (*bg, 255))
    draw = ImageDraw.Draw(img)
    use_pixel = size <= 64 if pixel is None else pixel
    if use_pixel:
        draw_eight_bar_h_pixel(draw, size, GOLD)
    else:
        draw_eight_bar_h_float(draw, size, GOLD, inset=inset)

    if rounded:
        mask = rounded_rect_mask(size, max(1, size * radius_ratio))
        out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        out.paste(img, (0, 0), mask)
        return out
    return img


def save(img: Image.Image, name: str) -> None:
    path = PUBLIC / name
    # Preserve crisp pixels for small icons
    img.save(path, format="PNG", optimize=True)
    print(f"wrote {path.relative_to(PUBLIC.parent)} ({img.size[0]}x{img.size[1]})")


def main() -> None:
    save(make_icon(32, bg=WHITE, rounded=True, radius_ratio=0.22), "favicon-day.png")
    save(make_icon(32, bg=BLACK, rounded=True, radius_ratio=0.22), "favicon-night.png")
    save(make_icon(16, bg=WHITE, rounded=False), "favicon-16-day.png")
    save(make_icon(16, bg=BLACK, rounded=False), "favicon-16-night.png")

    save(make_icon(32, bg=WHITE, rounded=True, radius_ratio=0.22), "icon-light-32x32.png")
    save(make_icon(32, bg=BLACK, rounded=True, radius_ratio=0.22), "icon-dark-32x32.png")

    save(
        make_icon(180, bg=BLACK, rounded=True, radius_ratio=0.223, inset=0.20, pixel=False),
        "apple-icon.png",
    )
    save(make_icon(192, bg=BLACK, rounded=True, radius_ratio=0.22, inset=0.20, pixel=False), "icon-192.png")
    save(make_icon(512, bg=BLACK, rounded=True, radius_ratio=0.22, inset=0.20, pixel=False), "icon-512.png")
    save(
        make_icon(192, bg=WHITE, rounded=True, radius_ratio=0.22, inset=0.20, pixel=False),
        "icon-192-light.png",
    )
    save(
        make_icon(512, bg=WHITE, rounded=True, radius_ratio=0.22, inset=0.20, pixel=False),
        "icon-512-light.png",
    )


if __name__ == "__main__":
    main()
