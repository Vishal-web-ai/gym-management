from PIL import Image
import numpy as np

img = Image.open("public/herosection/hero-image.png").convert("RGBA")
arr = np.array(img, dtype=np.float32)

# Create alpha mask: black/near-black pixels become transparent
brightness = np.max(arr[:, :, :3], axis=2)

# Smooth alpha transition for clean edges
alpha = np.clip((brightness - 5) / 35.0, 0, 1)
alpha = (alpha * 255).astype(np.uint8)

arr[:, :, 3] = alpha
result = Image.fromarray(arr.astype(np.uint8), "RGBA")
result.save("public/herosection/hero-person.png", "PNG")

print(f"Saved hero-person.png — {result.size}")
print(f"Transparent pixels: {np.sum(alpha < 10)}/{alpha.size} ({100*np.sum(alpha < 10)/alpha.size:.1f}%)")
print(f"Visible pixels: {np.sum(alpha > 245)}/{alpha.size} ({100*np.sum(alpha > 245)/alpha.size:.1f}%)")
