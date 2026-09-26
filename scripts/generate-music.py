"""Render three deterministic, original electronic demo tracks as mono PCM WAV.

All notes, drum shapes, and waveforms are created here. No samples or recordings
are imported. These are development tracks pending owner rights review.
"""

from __future__ import annotations

import json
import math
import wave
from pathlib import Path

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / "public" / "audio"
CONTENT = ROOT / "public" / "content"
SAMPLE_RATE = 32000

TRACKS = [
    {
        "id": "neon-strike",
        "title": "Neon Strike",
        "artist": "Fight Till Beat Original",
        "bpm": 128,
        "bars": 36,
        "key": 45,
        "progression": [0, 8, 3, 10],
        "palette": ["#ff4ac6", "#7c5cff"],
        "mood": "ELECTRIC / HIGH ENERGY",
        "seed": 14,
    },
    {
        "id": "after-hours",
        "title": "After Hours",
        "artist": "Fight Till Beat Original",
        "bpm": 112,
        "bars": 32,
        "key": 41,
        "progression": [0, 5, 8, 3],
        "palette": ["#26d7ff", "#5347ed"],
        "mood": "DARK / HYPNOTIC",
        "seed": 27,
    },
    {
        "id": "laser-rush",
        "title": "Laser Rush",
        "artist": "Fight Till Beat Original",
        "bpm": 142,
        "bars": 40,
        "key": 48,
        "progression": [0, 10, 5, 7],
        "palette": ["#faff3d", "#ff7d3b"],
        "mood": "FAST / EUPHORIC",
        "seed": 93,
    },
]


def hz(midi: float) -> float:
    return 440.0 * 2 ** ((midi - 69) / 12)


def add_sound(out: np.ndarray, start: float, sound: np.ndarray, volume: float = 1.0) -> None:
    first = int(start * SAMPLE_RATE)
    if first >= len(out):
        return
    if first < 0:
        sound = sound[-first:]
        first = 0
    last = min(first + len(sound), len(out))
    out[first:last] += sound[: last - first] * volume


def kick(rng: np.random.Generator) -> np.ndarray:
    t = np.arange(int(0.48 * SAMPLE_RATE), dtype=np.float32) / SAMPLE_RATE
    phase = 2 * np.pi * (53 * t + 95 * (1 - np.exp(-t * 46)) / 46)
    body = np.sin(phase) * np.exp(-t * 12)
    click = rng.standard_normal(len(t)).astype(np.float32) * np.exp(-t * 110) * 0.12
    return (body + click).astype(np.float32)


def snare(rng: np.random.Generator) -> np.ndarray:
    t = np.arange(int(0.28 * SAMPLE_RATE), dtype=np.float32) / SAMPLE_RATE
    raw = rng.standard_normal(len(t)).astype(np.float32)
    high = raw - np.convolve(raw, np.ones(9, dtype=np.float32) / 9, mode="same")
    tone = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 22)
    return (0.28 * high * np.exp(-t * 23) + 0.22 * tone).astype(np.float32)


def hat(rng: np.random.Generator, open_hat: bool = False) -> np.ndarray:
    t = np.arange(int((0.25 if open_hat else 0.09) * SAMPLE_RATE), dtype=np.float32) / SAMPLE_RATE
    raw = rng.standard_normal(len(t)).astype(np.float32)
    high = raw - np.convolve(raw, np.ones(5, dtype=np.float32) / 5, mode="same")
    return (high * np.exp(-t * (19 if open_hat else 65)) * 0.12).astype(np.float32)


def bass(note: float, duration: float) -> np.ndarray:
    t = np.arange(int(duration * SAMPLE_RATE), dtype=np.float32) / SAMPLE_RATE
    f = hz(note)
    phase = (f * t) % 1
    saw = 2 * phase - 1
    wave_data = 0.52 * np.sin(2 * np.pi * f * t) + 0.20 * saw
    attack = np.minimum(t * 100, 1)
    decay = np.exp(-t * 3.8)
    return (wave_data * attack * decay).astype(np.float32)


def chord(notes: list[float], duration: float) -> np.ndarray:
    t = np.arange(int(duration * SAMPLE_RATE), dtype=np.float32) / SAMPLE_RATE
    wave_data = np.zeros_like(t)
    for note in notes:
        f = hz(note)
        wave_data += np.sin(2 * np.pi * f * t) + 0.23 * np.sin(2 * np.pi * 2.01 * f * t)
    env = np.minimum(t * 5, 1) * np.minimum((duration - t) * 5, 1)
    return (wave_data * env * 0.035).astype(np.float32)


def lead(note: float, duration: float) -> np.ndarray:
    t = np.arange(int(duration * SAMPLE_RATE), dtype=np.float32) / SAMPLE_RATE
    f = hz(note)
    mod = 2.2 * np.sin(2 * np.pi * 2.01 * f * t) * np.exp(-t * 8)
    bell = np.sin(2 * np.pi * f * t + mod) + 0.18 * np.sin(2 * np.pi * 3 * f * t)
    env = np.minimum(t * 120, 1) * np.exp(-t * 5)
    return (bell * env * 0.18).astype(np.float32)


def render_track(spec: dict, index: int) -> dict:
    rng = np.random.default_rng(spec["seed"])
    beat_s = 60.0 / spec["bpm"]
    duration = spec["bars"] * 4 * beat_s
    out = np.zeros(int(duration * SAMPLE_RATE), dtype=np.float32)
    kick_sample = kick(rng)
    snare_sample = snare(rng)
    hat_sample = hat(rng)
    open_hat_sample = hat(rng, True)
    majorish = [0, 3, 7, 10]
    lead_pattern = [0, 7, 10, 7, 3, 7, 12, 10]

    for bar in range(spec["bars"]):
        bar_time = bar * 4 * beat_s
        root = spec["key"] + spec["progression"][(bar // 4) % 4]
        is_intro = bar < 4
        is_break = spec["bars"] * 0.62 <= bar < spec["bars"] * 0.72
        is_final = bar >= spec["bars"] - 2
        is_drop = 16 <= bar < spec["bars"] - 2 and not is_break

        add_sound(out, bar_time, chord([root + 12 + v for v in majorish[:3]], 4 * beat_s), 0.78 if is_break else 1)

        for beat in range(4):
            t = bar_time + beat * beat_s
            if not is_break and not is_final:
                add_sound(out, t, kick_sample, 0.75 if is_intro else 1)
            if beat in (1, 3) and not is_intro and not is_break and not is_final:
                add_sound(out, t, snare_sample)
            if not is_final:
                add_sound(out, t, hat_sample, 0.6 if is_intro or is_break else 1)
                add_sound(out, t + 0.5 * beat_s, open_hat_sample if is_drop and beat % 2 else hat_sample, 0.65)

            if not is_intro and not is_break and not is_final:
                bass_note = root - 12 + ([0, 0, 7, 10][beat])
                add_sound(out, t + (0.5 * beat_s if beat == 3 else 0), bass(bass_note, 0.45 * beat_s), 1.15)

        if not is_intro and not is_final:
            for step in range(8):
                if is_break and step % 2:
                    continue
                note = root + 24 + lead_pattern[(step + bar) % len(lead_pattern)]
                if is_drop or step % 2 == 0:
                    add_sound(out, bar_time + step * 0.5 * beat_s, lead(note, 0.4 * beat_s), 0.8 if is_break else 1)

        if bar == spec["bars"] - 1:
            add_sound(out, bar_time, chord([root + 12, root + 19, root + 24], 4 * beat_s), 1.5)

    out = np.tanh(out * 1.25)
    peak = float(np.max(np.abs(out)))
    if peak:
        out *= 0.88 / peak
    pcm = (out * 32767).astype("<i2")
    filename = AUDIO / f'{spec["id"]}.wav'
    with wave.open(str(filename), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SAMPLE_RATE)
        f.writeframes(pcm.tobytes())

    beat_times = [round(i * beat_s * 1000) for i in range(spec["bars"] * 4)]
    events = []
    for i, at in enumerate(beat_times):
        bar = i // 4
        if bar < 4 or bar >= spec["bars"] - 2:
            continue
        if spec["bars"] * 0.62 <= bar < spec["bars"] * 0.72:
            kind = "dodge" if i % 4 == 0 else "dance"
        elif i % 16 == 0 and bar > 16:
            kind = "finisher" if bar > spec["bars"] - 8 else "launch"
        elif i % 4 == 0:
            kind = "kick"
        elif i % 2 == 0:
            kind = "punch"
        else:
            kind = "step"
        if kind != "step" or i % 4 == 1:
            events.append({"id": f"{spec['id']}-{i}", "atMs": at, "kind": kind, "actorId": "hero", "targetId": f"enemy-{(bar // 4) % 3 + 1}"})

    cue = {
        "schemaVersion": 1,
        "trackId": spec["id"],
        "bpm": spec["bpm"],
        "durationMs": round(duration * 1000),
        "beatsMs": beat_times,
        "phrasesMs": [round(bar * 4 * beat_s * 1000) for bar in range(0, spec["bars"], 4)],
        "events": events,
    }
    (CONTENT / f'{spec["id"]}.json').write_text(json.dumps(cue, separators=(",", ":")), encoding="utf-8")
    return {
        "id": spec["id"],
        "title": spec["title"],
        "artist": spec["artist"],
        "bpm": spec["bpm"],
        "durationSec": round(duration, 2),
        "mood": spec["mood"],
        "colors": spec["palette"],
        "audio": f'/audio/{spec["id"]}.wav',
        "cues": f'/content/{spec["id"]}.json',
        "rightsId": f'MUSIC-{index:03d}',
    }


def main() -> None:
    AUDIO.mkdir(parents=True, exist_ok=True)
    CONTENT.mkdir(parents=True, exist_ok=True)
    result = [render_track(track, index) for index, track in enumerate(TRACKS, start=1)]
    (CONTENT / "tracks.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
    print("Generated", len(result), "tracks")
    for track in result:
        print(track["title"], track["durationSec"], "seconds", track["audio"])


if __name__ == "__main__":
    main()
