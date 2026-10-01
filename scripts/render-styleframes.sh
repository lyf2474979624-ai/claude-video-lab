#!/usr/bin/env bash

set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
output_dir="$project_dir/out/styleframes"

mkdir -p "$output_dir"
cd "$project_dir"

npx remotion still Styleframe-01-Ignition "$output_dir/01-ignition.png"
npx remotion still Styleframe-02-Drift "$output_dir/02-drift.png"
npx remotion still Styleframe-03-Fracture "$output_dir/03-fracture.png"
npx remotion still Styleframe-04-Emergence "$output_dir/04-emergence.png"
npx remotion still Styleframe-05-Afterimage "$output_dir/05-afterimage.png"

ffmpeg -y \
  -i "$output_dir/01-ignition.png" \
  -i "$output_dir/02-drift.png" \
  -i "$output_dir/03-fracture.png" \
  -i "$output_dir/04-emergence.png" \
  -i "$output_dir/05-afterimage.png" \
  -filter_complex "[0:v]scale=960:402[a];[1:v]scale=960:402[b];[2:v]scale=960:402[c];[3:v]scale=960:402[d];[4:v]scale=960:402[e];color=c=#030509:s=960x402[f];[a][b][c][d][e][f]xstack=inputs=6:layout=0_0|960_0|0_402|960_402|0_804|960_804:fill=#030509[out]" \
  -map "[out]" \
  -frames:v 1 \
  "$output_dir/contact-sheet.png"

echo "Rendered styleframes to $output_dir"
