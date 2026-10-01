#!/usr/bin/env bash

set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"

cd "$project_dir"
./scripts/generate-audio.sh
mkdir -p out
npx remotion render SignalFormFilm out/signal-form-film.mp4 --crf=22

echo "Rendered film to $project_dir/out/signal-form-film.mp4"
