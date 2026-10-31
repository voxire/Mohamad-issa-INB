#!/usr/bin/env bash
# Builds the hero loop from the free Pexels clip in assets/video (marina.mp4, Pexels #34529274).
# Grade: softly desaturated with cool shadows, gently slowed, and a seamless crossfade loop
# (the last 1.5s dissolves into the first frames, so there is no dip to black).
set -euo pipefail
cd "$(dirname "$0")/.."
IN=assets/video
OUT=public/media
GRADE="eq=saturation=0.5:contrast=1.08:brightness=0.0:gamma=1.0,colorbalance=rs=-0.03:bs=0.06:rm=-0.01:bm=0.03"
XF=1.5

# 1) graded, slowed base clip (~16s)
ffmpeg -v error -y -ss 1.5 -t 13 -i $IN/marina.mp4 \
  -vf "setpts=1.25*PTS,fps=30,scale=1382:778,crop=1280:720:51:20,setsar=1,$GRADE,format=yuv420p" \
  -an -c:v libx264 -preset slow -crf 20 /tmp/hero-base.mp4
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 /tmp/hero-base.mp4)

# 2) seamless loop: body = [XF..end], head = [0..XF]; dissolve body's tail into head
ffmpeg -v error -y -i /tmp/hero-base.mp4 -filter_complex "\
[0:v]split[a][b];\
[a]trim=start=$XF,setpts=PTS-STARTPTS[body];\
[b]trim=end=$XF,setpts=PTS-STARTPTS[head];\
[body][head]xfade=transition=fade:duration=$XF:offset=$(echo "$DUR-2*$XF" | bc),format=yuv420p[v]" \
  -map "[v]" -an -c:v libx264 -preset slow -crf 26 -movflags +faststart $OUT/hero-desktop.mp4

# mobile: 9:16 crop from the lower part of the frame (the towers, not the night sky),
# slightly zoomed so the skyline reads behind the portrait on a phone
ffmpeg -v error -y -i $OUT/hero-desktop.mp4 -vf "crop=330:587:(iw-330)/2:ih-587,scale=406:720:flags=lanczos,setsar=1" -an -c:v libx264 -preset slow -crf 26 -movflags +faststart $OUT/hero-mobile.mp4
# poster frames (first frame, so the poster matches the moment playback starts)
ffmpeg -v error -y -i $OUT/hero-desktop.mp4 -frames:v 1 -q:v 3 $OUT/hero-poster.jpg
ffmpeg -v error -y -i $OUT/hero-mobile.mp4 -frames:v 1 -q:v 3 $OUT/hero-poster-mobile.jpg
ls -la $OUT/hero-*
