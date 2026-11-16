#!/usr/bin/env bash
# Builds the hero loop from the clip Mohamad chose (WhatsApp, 13 Nov 2026), kept in assets/video (not committed):
#   palm-aerial-canva.mp4 = aerial of Palm Jumeirah and Atlantis at dawn, from his Canva Pro account
#   (11s; the WhatsApp copy is 1024x576. Swap in the original Canva export when he sends it and rerun).
# Grade: the pink dawn is pulled down and desaturated so the sea and towers sit in his charcoal and beige.
# Seamless crossfade loop (the tail dissolves into the head).
# Earlier source (Nov 2026): Pexels #35027116, dubai-night-towers-4k.mp4.
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=${1:-assets/video/palm-aerial-canva.mp4}
OUT=public/media
GRADE="eq=saturation=0.38:contrast=1.08:brightness=-0.05:gamma=0.92,colorbalance=rs=-0.06:gs=-0.01:bs=0.04:rm=-0.05:bm=0.02:rh=0.02:bh=-0.02"
XF=1.5

loop() { # $1 = input base, $2 = output, $3 = crf, $4 = maxrate
  local dur
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$1")
  ffmpeg -v error -y -i "$1" -filter_complex "\
[0:v]split[a][b];\
[a]trim=start=$XF,setpts=PTS-STARTPTS[body];\
[b]trim=end=$XF,setpts=PTS-STARTPTS[head];\
[body][head]xfade=transition=fade:duration=$XF:offset=$(echo "$dur-2*$XF" | bc),format=yuv420p[v]" \
    -map "[v]" -an -c:v libx264 -preset slow -crf "$3" -maxrate "$4" -bufsize "$4" -movflags +faststart "$2"
}

# Desktop: full frame at 1920x1080
ffmpeg -v error -y -i "$SRC" \
  -vf "fps=30,scale=1920:1080:flags=lanczos,setsar=1,$GRADE,format=yuv420p" \
  -an -c:v libx264 -preset slow -crf 16 /tmp/hero-base-desktop.mp4
loop /tmp/hero-base-desktop.mp4 $OUT/hero-desktop.mp4 24 2.6M

# Phone: a centred 9:16 crop (the Palm's trunk and Atlantis), at 720x1280
ffmpeg -v error -y -i "$SRC" \
  -vf "fps=30,crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=720:1280:flags=lanczos,setsar=1,$GRADE,format=yuv420p" \
  -an -c:v libx264 -preset slow -crf 16 /tmp/hero-base-mobile.mp4
loop /tmp/hero-base-mobile.mp4 $OUT/hero-mobile.mp4 24 1.8M

# Poster frames (first frame, so the poster matches the moment playback starts)
ffmpeg -v error -y -i $OUT/hero-desktop.mp4 -frames:v 1 -q:v 3 $OUT/hero-poster.jpg
ffmpeg -v error -y -i $OUT/hero-mobile.mp4 -frames:v 1 -q:v 3 $OUT/hero-poster-mobile.jpg
ls -la $OUT/hero-*
