#!/usr/bin/env bash
# Builds the hero loop from the free Pexels clip in assets/video (marina.mp4, Pexels #34529274).
# Grade: desaturated, cool shadows, slightly darkened, slowed, with a dip to black for a seamless loop.
set -euo pipefail
cd "$(dirname "$0")/.."
IN=assets/video
OUT=public/media
GRADE="eq=saturation=0.38:contrast=1.06:brightness=-0.05:gamma=0.95,colorbalance=rs=-0.04:bs=0.07:rm=-0.02:bm=0.04"
ffmpeg -v error -y \
  -ss 2 -t 10 -i $IN/marina.mp4 \
  -vf "setpts=1.6*PTS,fps=30,scale=1382:778,crop=1280:720:51:20,setsar=1,$GRADE,fade=t=in:st=0:d=1.2,format=yuv420p" \
  -an -c:v libx264 -preset slow -crf 27 -movflags +faststart -t 16 $OUT/hero-desktop.mp4
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT/hero-desktop.mp4)
# fade out at the end so the loop dips through black
ffmpeg -v error -y -i $OUT/hero-desktop.mp4 -vf "fade=t=out:st=$(echo "$DUR-1.0" | bc):d=1.0" -an -c:v libx264 -preset slow -crf 27 -movflags +faststart $OUT/hero-desktop.tmp.mp4
mv $OUT/hero-desktop.tmp.mp4 $OUT/hero-desktop.mp4
# mobile: centre crop to 9:16
ffmpeg -v error -y -i $OUT/hero-desktop.mp4 -vf "crop=406:720:(iw-406)/2:0" -an -c:v libx264 -preset slow -crf 27 -movflags +faststart $OUT/hero-mobile.mp4
# poster frames
ffmpeg -v error -y -ss 3 -i $OUT/hero-desktop.mp4 -frames:v 1 -q:v 3 $OUT/hero-poster.jpg
ffmpeg -v error -y -ss 3 -i $OUT/hero-mobile.mp4 -frames:v 1 -q:v 3 $OUT/hero-poster-mobile.jpg
ls -la $OUT
