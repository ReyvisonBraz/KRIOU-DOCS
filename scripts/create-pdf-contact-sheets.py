from pathlib import Path
from PIL import Image, ImageDraw

source = Path("tmp/pdfs/all")
target = Path("tmp/pdfs/contact-sheets")
target.mkdir(parents=True, exist_ok=True)
files = sorted(source.glob("*.png"))
thumb_w, thumb_h = 248, 351
cell_w, cell_h = 270, 385
cols, rows = 4, 3

for sheet_index in range(0, len(files), cols * rows):
    batch = files[sheet_index:sheet_index + cols * rows]
    sheet = Image.new("RGB", (cell_w * cols, cell_h * rows), "#d9dde2")
    draw = ImageDraw.Draw(sheet)
    for index, file in enumerate(batch):
        image = Image.open(file).convert("RGB")
        image.thumbnail((thumb_w, thumb_h))
        x = (index % cols) * cell_w + (cell_w - image.width) // 2
        y = (index // cols) * cell_h + 20
        sheet.paste(image, (x, y))
        label = file.stem[:42]
        draw.text(((index % cols) * cell_w + 8, (index // cols) * cell_h + 3), label, fill="#202632")
    sheet.save(target / f"contato-{sheet_index // (cols * rows) + 1:02}.jpg", quality=88)

print(f"{len(files)} páginas em {(len(files) + cols * rows - 1) // (cols * rows)} folhas de contato")
