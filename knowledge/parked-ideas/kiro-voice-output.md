# Parked Idea: Voice Output for Kiro CLI

## Problem
Working locally in silence gets boring. Want to hear responses spoken aloud.

## What We Tried (2026-05-08)
- Edge TTS (free, neural voices) — voice quality decent but Windows MediaPlayer playback was janky/silent
- Pitch shifting for "space marine" effect — robotic without ffmpeg for proper audio processing

## Options for Later
| Option | Cost | Quality | Notes |
|--------|------|---------|-------|
| Piper (local) | Free | Good | Open source, CPU-only, ~15-100MB models, no internet |
| ElevenLabs | $5-22/mo | Excellent | Free tier burns fast (~10 min/month), voice cloning on paid |
| Edge TTS | Free | Good | Needs ffmpeg for post-processing, playback needs better player |

## Revisit When
- Find a reliable Windows audio player (mpv, vlc CLI, or install ffmpeg)
- Or want to invest $5/mo in ElevenLabs for premium quality
- Or Piper releases better voice models
