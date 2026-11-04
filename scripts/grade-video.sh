#!/usr/bin/env bash
# Builds the hero loop from the free 4K Pexels clip in assets/video (not committed):
#   dubai-night-towers-4k.mp4 = "Stunning Aerial Night View of Dubai Skyscrapers" by Magda Ehlers,
#   pexels.com/video/35027116 (3840x2160, free to use, no credit required).
# Grade: softly desaturated with warm highlights and cool shadows, so the city lights read as
# his beige and the sky as charcoal. Seamless crossfade loop (the tail dissolves into the head).
# Both versions are cut from the 4K source, so the phone crop stays sharp.
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=assets/video/dubai-night-towers-4k.mp4
OUT=public/media
GRADE="eq=saturation=0.55:contrast=1.06:gamma=0.97,colorbalance=rs=-0.02:bs=0.05:rh=0.04:gh=0.01:bh=-0.03"
START=2
LEN=20
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
ffmpeg -v error -y -ss $START -t $LEN -i $SRC \
  -vf "fps=30,scale=1920:1080:flags=lanczos,setsar=1,$GRADE,format=yuv420p" \
  -an -c:v libx264 -preset slow -crf 16 /tmp/hero-base-desktop.mp4
loop /tmp/hero-base-desktop.mp4 $OUT/hero-desktop.mp4 27 2.6M

# Phone: a 9:16 crop of the skyline and highway (dark sky behind his face), straight from the 4K source, at 720x1280
ffmpeg -v error -y -ss $START -t $LEN -i $SRC \
  -vf "fps=30,crop=1215:2160:700:0,scale=720:1280:flags=lanczos,setsar=1,$GRADE,format=yuv420p" \
  -an -c:v libx264 -preset slow -crf 16 /tmp/hero-base-mobile.mp4
loop /tmp/hero-base-mobile.mp4 $OUT/hero-mobile.mp4 25 1.8M

# Poster frames (first frame, so the poster matches the moment playback starts)
ffmpeg -v error -y -i $OUT/hero-desktop.mp4 -frames:v 1 -q:v 3 $OUT/hero-poster.jpg
ffmpeg -v error -y -i $OUT/hero-mobile.mp4 -frames:v 1 -q:v 3 $OUT/hero-poster-mobile.jpg
ls -la $OUT/hero-*
