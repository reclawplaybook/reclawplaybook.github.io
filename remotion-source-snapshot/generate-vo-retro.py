#!/usr/bin/env python3
"""Generate voiceover for the retro Mario-style promo video."""

import asyncio
import os
import edge_tts

VOICE = "en-US-RogerNeural"
RATE = "+18%"
PITCH = "+4Hz"
OUT_DIR = os.path.join(os.path.dirname(__file__), "public", "vo")
os.makedirs(OUT_DIR, exist_ok=True)

SEGMENTS = [
    # Hook (0-5s): Game Over for chatbots
    ("retro-01-gameover",
     "Game over. Your AI forgot everything. Again."),

    # Problem (5-17s): No extra lives
    ("retro-02-problem",
     "No memory. No follow-through. No persistence. Every chat starts at zero. One life. No save file."),

    # Level 1 (17-32s): The Install
    ("retro-03-install",
     "Level one. One command. ReClaw installs on your own machine or server — wherever you are. Answer a few questions. Add three identity files. Your agent is live."),

    # Level 2 (32-44s): Doctor + Identity (power-ups)
    ("retro-04-powerups",
     "Level two. Power up. Run reclaw doctor. Nine checks. All green. Then customize Soul, User, and Directive. Plain text. No code. Every file makes the agent stronger."),

    # Level 3 (44-60s): Heartbeat (star power)
    ("retro-05-heartbeat",
     "Level three. Star power. Heartbeats run on a schedule. If something needs attention, it acts. If not — silence. When your agent speaks, something changed."),

    # Boss Level (60-82s): The Team
    ("retro-06-boss",
     "Boss level. One agent is good. A team is better. Six specialists ship with the kit: Ops, Scout, Roy, Duke, Darlene, and Tank. One command deploys the squad."),

    # High Score (82-95s): Price + proof
    ("retro-07-highscore",
     "New high score. Two hundred fifteen passing tests. Twenty-four seven operation. Runs on your own machine. Your data. Your server. Your rules. Sixty-seven dollars. One time. No subscription."),

    # Insert Coin (95-110s): CTA
    ("retro-08-cta",
     "Insert coin to continue. reclaw playbook dot com. Build it once. Run it forever."),
]


async def generate(seg_id: str, text: str):
    out_path = os.path.join(OUT_DIR, f"{seg_id}.mp3")
    # Always regenerate promo VO for latest pacing/inflection.
    if os.path.exists(out_path):
        os.remove(out_path)

    communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(out_path)
    size_kb = os.path.getsize(out_path) / 1024
    est_dur = os.path.getsize(out_path) / 6000  # rough estimate
    print(f"  OK   {seg_id} ({size_kb:.0f}KB, ~{est_dur:.1f}s)")


async def main():
    print(f"Generating {len(SEGMENTS)} retro promo VO segments...\n")
    for seg_id, text in SEGMENTS:
        try:
            await generate(seg_id, text)
        except Exception as e:
            print(f"  FAIL {seg_id}: {e}")
    print("\nDone!")


asyncio.run(main())
