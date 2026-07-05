---
layout: post
title: "MuseScore Exporter"
date: 2026-07-05 15:21:19
categories: python music
---

Not really a post, but I wanted to share a helpful script I wrote a while ago.
On my site, I have [all my notated music](/scores/).
The script posted here is a crucial part of that workflow, and I thought it'd be interesting to share.

In short, you can point it at a MuseScore file like so:
```
$ python3 export.py ~/Documents/MuseScore4/Scores/NyanCat.mscz"
```

and it'll do two things:
- Generate a mp3 file with a MIDI export of the score
- Generate a pdf file with the conductor's score, and all individual parts.

Some caveats:
- You'll need to make sure `mscore` is an executable in your path. Mine's installed via homebrew.
- You'll also need ghostscript (`gs`), which I also installed with homebrew.
- It dumps the files into `/tmp/musescore-exports`. I never got around to making the output location smarter.

Here's the code:
```python
import json
import sys
import os
import subprocess
import base64


def mscore(*args):
    process = subprocess.run(["mscore"] + list(args))
    return process.stdout


if len(sys.argv) < 2:
    print("Usage: python export.py file.mscz")
    sys.exit(1)

filename = sys.argv[1]

# Create a clean working export directory
export_dir = "/tmp/musescore-exports"
if not os.path.exists(export_dir):
    os.makedirs(export_dir)
for f in os.listdir(export_dir):
    file_path = os.path.join(export_dir, f)
    if os.path.isfile(file_path):
        os.remove(file_path)

filename_no_ext = os.path.splitext(os.path.basename(filename))[0]

# Create an mp3 file as output
mscore("-o", f"{export_dir}/{filename_no_ext}.mp3", filename)

# Export parts to JSON. The --export-score-parts flag is broken in MuseScore 4,
# so we instead resort to a JSON export of parts and then generate individual
# PDF files that way.
# See: https://github.com/musescore/MuseScore/issues/22887
mscore("-o", f"{export_dir}/{filename_no_ext}.json", "--score-parts-pdf", filename)

# Read the file, generating individual parts into PDF
with open(f"{export_dir}/{filename_no_ext}.json", "r") as f:
    part_data = json.loads(f.read())


exported_pdfs = []

for name, encoded_pdf in zip(part_data["parts"], part_data["partsBin"]):
    print(f"Exporting part {name}...")
    tidy_name = name.replace("/", "_")
    output_filename = f"{export_dir}/{filename_no_ext}_{tidy_name}.pdf"
    pdf_bytes = base64.b64decode(encoded_pdf)
    with open(output_filename, "wb") as pdf_file:
        pdf_file.write(pdf_bytes)

    exported_pdfs.append(output_filename)

# if there's more than one part in the score, go ahead and export a conductors
# score too
if len(part_data["parts"]) > 1:
    print("Exporting conductors score")
    conductors_score_path = f"{export_dir}/{filename_no_ext}_conductor.pdf"
    mscore("-o", conductors_score_path, filename)
    exported_pdfs.insert(0, conductors_score_path)  # conductors score at the front


# Create a "mega" PDF with all parts in it
command = [
    "gs",
    "-q",
    "-sDEVICE=pdfwrite",
    "-o",
    f"{export_dir}/{filename_no_ext}.pdf",
] + exported_pdfs
subprocess.run(command)

# Clean up the intermediate PDF files
for pdf in exported_pdfs:
    os.remove(pdf)
os.remove(f"{export_dir}/{filename_no_ext}.json")

print("DONE!")
print(f"Audio available at:      {export_dir}/{filename_no_ext}.mp3")
print(f"Full score available at: {export_dir}/{filename_no_ext}.pdf")
```
