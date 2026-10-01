#!/usr/bin/env bash

set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
audio_dir="$project_dir/public/audio/signal-form"

mkdir -p "$audio_dir"

voice="${SIGNAL_VOICE:-Tingting}"
rate="${SIGNAL_VOICE_RATE:-175}"

say -v "$voice" -r "$rate" -o "$audio_dir/voice-01.aiff" \
  "一切画面，都从一个还没有形状的念头开始。"
say -v "$voice" -r "$rate" -o "$audio_dir/voice-02.aiff" \
  "它寻找方向，寻找节奏，也寻找能够承载它的结构。"
say -v "$voice" -r "$rate" -o "$audio_dir/voice-03.aiff" \
  "但第一次成形，往往伴随着失真。"
say -v "$voice" -r "$rate" -o "$audio_dir/voice-04.aiff" \
  "当颜色、声音和运动彼此回应，结构就开始发光。"
say -v "$voice" -r "$rate" -o "$audio_dir/voice-05.aiff" \
  "画面不是装饰。它是一个念头，终于被看见的瞬间。"

for source in "$audio_dir"/*.aiff; do
  target="${source%.aiff}.wav"
  ffmpeg -y -i "$source" -ar 48000 -ac 1 -c:a pcm_s24le "$target" -loglevel error
done

ffmpeg -y \
  -f lavfi -i "aevalsrc=0.16*sin(2*PI*(55+1.4*sin(2*PI*t/11))*t)+0.07*sin(2*PI*82.41*t)+0.035*sin(2*PI*110*t):s=48000:d=33" \
  -f lavfi -i "anoisesrc=color=pink:amplitude=0.025:sample_rate=48000:duration=33" \
  -filter_complex "[0:a]lowpass=f=420,afade=t=in:st=0:d=2.5,afade=t=out:st=29:d=4[a];[1:a]lowpass=f=1300,highpass=f=160,afade=t=in:st=0:d=4,afade=t=out:st=30:d=3[b];[a][b]amix=inputs=2:normalize=0,volume=0.64[out]" \
  -map "[out]" -ar 48000 -c:a pcm_s24le "$audio_dir/score.wav" -loglevel error

ffmpeg -y -f lavfi \
  -i "aevalsrc=0.45*sin(2*PI*(165+680*t)*t)*exp(-5.2*t):s=48000:d=1.2" \
  -af "afade=t=out:st=0.45:d=0.75" -ar 48000 -c:a pcm_s24le \
  "$audio_dir/pulse.wav" -loglevel error

ffmpeg -y \
  -f lavfi -i "anoisesrc=color=white:amplitude=0.42:sample_rate=48000:duration=0.7" \
  -f lavfi -i "aevalsrc=0.34*sin(2*PI*(1480-1100*t)*t)*exp(-5*t):s=48000:d=0.7" \
  -filter_complex "[0:a]highpass=f=1100,afade=t=out:st=0.05:d=0.62[n];[1:a]afade=t=out:st=0.08:d=0.6[t];[n][t]amix=inputs=2:normalize=0,volume=0.55[out]" \
  -map "[out]" -ar 48000 -c:a pcm_s24le "$audio_dir/fracture.wav" -loglevel error

ffmpeg -y -f lavfi \
  -i "aevalsrc=(0.18*sin(2*PI*220*t)+0.13*sin(2*PI*329.63*t)+0.11*sin(2*PI*440*t))*exp(-0.72*t):s=48000:d=4" \
  -af "aecho=0.7:0.55:280|520:0.28|0.16,afade=t=out:st=2.8:d=1.2" \
  -ar 48000 -c:a pcm_s24le "$audio_dir/emergence.wav" -loglevel error

printf 'Generated audio in %s\n' "$audio_dir"
for file in "$audio_dir"/*.wav; do
  duration="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$file")"
  printf '%-22s %6.2fs\n' "$(basename "$file")" "$duration"
done
