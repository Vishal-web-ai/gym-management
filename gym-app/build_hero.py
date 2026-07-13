from PIL import Image, ImageEnhance, ImageFilter
import numpy as np
import os

W, H = 1536, 1024

# 1. Load background
bg = Image.open('public/herosection/background.jpg').convert('RGBA')
bg_ratio = bg.width / bg.height
if bg_ratio > W / H:
    new_h = H
    new_w = int(H * bg_ratio)
else:
    new_w = W
    new_h = int(W / bg_ratio)
bg = bg.resize((new_w, new_h), Image.LANCZOS)
left = (new_w - W) // 2
top = (new_h - H) // 2
bg = bg.crop((left, top, left + W, top + H))

# Keep background at moderate brightness
darkener = ImageEnhance.Brightness(bg)
bg = darkener.enhance(0.4)

# 2. Load hero image and extract subject with alpha mask
hero_raw = Image.open('public/herosection/hero-image.png').convert('RGB')
hero_arr = np.array(hero_raw, dtype=np.float32)

# Create alpha mask from brightness (black background -> transparent)
brightness = np.max(hero_arr, axis=2)
# Soft threshold for smooth edges
alpha = np.clip((brightness - 5) / 40.0, 0, 1)
alpha = (alpha * 255).astype(np.uint8)

hero_rgba = np.dstack([hero_arr.astype(np.uint8), alpha])
hero_img = Image.fromarray(hero_rgba, 'RGBA')

# Scale hero to fit canvas
target_hero_h = int(H * 0.90)
hero_scale = target_hero_h / hero_img.height
target_hero_w = int(hero_img.width * hero_scale)
hero_img = hero_img.resize((target_hero_w, target_hero_h), Image.LANCZOS)

# Center the hero
hero_x = (W - target_hero_w) // 2
hero_y = (H - target_hero_h) // 2

# 3. Composite
result = bg.copy()
result.paste(hero_img, (hero_x, hero_y), hero_img)

# 4. Gradient overlay (vignette + bottom fade)
result_arr = np.array(result, dtype=np.float32)

yy, xx = np.mgrid[0:H, 0:W]
cx, cy = W / 2, H / 2
dx = (xx - cx) / cx
dy = (yy - cy) / cy
dist = np.sqrt(dx**2 + dy**2)
dist = np.clip(dist, 0, 1.5)

# Radial vignette (edges darken)
vignette = (dist ** 2.0) * 0.4
vignette = np.clip(vignette, 0, 0.4)

# Bottom gradient (for text overlay area)
bottom_grad = np.clip((yy / H - 0.6) / 0.4, 0, 1) * 0.5

# Top subtle darkening
top_grad = np.clip((1 - yy / H - 0.9) / 0.1, 0, 1) * 0.35

dark_mask = np.clip(vignette + bottom_grad + top_grad, 0, 0.65)

for c in range(3):
    result_arr[:, :, c] = result_arr[:, :, c] * (1 - dark_mask)

result_arr = np.clip(result_arr, 0, 255).astype(np.uint8)
result = Image.fromarray(result_arr, 'RGBA')
result_rgb = result.convert('RGB')
result_rgb.save('public/herosection/hero-section-new.png', 'PNG')

arr2 = np.array(result_rgb)
print(f'Size: {result_rgb.size}')
print(f'Avg brightness: {np.mean(arr2):.1f}/255')
print(f'Center brightness: {np.mean(arr2[H//4:3*H//4, W//4:3*W//4]):.1f}/255')
fsize = os.path.getsize('public/herosection/hero-section-new.png')
print(f'File size: {fsize / 1024:.0f} KB')
