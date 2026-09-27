# Game and visual design

## Core loop

Open → choose/preview song → review motion/flash settings → Start Fight → watch beat driven fight → victory/summary → replay or choose another track. The player directs the music choice and playback, while the hero fights automatically. The experience should clearly communicate that it is an interactive music spectacle rather than manual combat.

## Visual language

Owner direction: anime-inspired combat, cinematic camera angles, and expressive movement; the initial humanoid upgrade was rejected as too rigid. The local build retains the textured humanoid rig, with stepped lighting, colored rim light, spiked hair, and a cyan scarf on the white-haired hero. Four actors still share a base mesh; distinct faces/body designs remain open. The latest revision replaces the procedural DJ and crowd with animated human models. Audience placement keeps the foreground clear.

Combat flows through breathing guards, short curved dashes, loaded wind-ups, fast jab/cross bursts, aerial kicks, rising launches, opponent knockback, crouch slips against counterpunches, dance, and a turning airborne finisher. A 45 ms contact hold emphasizes impact while the music continues normally. Scarf motion, cyan attack arcs/dash streaks, and localized gold impact shards support the movement. The three cue maps now include extra beat-aligned punches in selected bars; no unscored secondary hits are invented by the renderer. Model loading completes before music starts and failed loads remain retryable.

## Beat-to-action grammar

- Intro: hero entrance, DJ introduction, camera establishes arena.
- Verse/first phrase: light enemies enter; single-beat punches and dodges teach the movement vocabulary.
- Chorus/drop: stronger impacts, short combinations, dynamic but readable camera angles.
- Break: dance-like repositioning and anticipation instead of incessant punches.
- Final phrase: a clear finisher with enemy reaction and victory tableau.

Actions must have anticipation, contact, and recovery. The contact frame aligns to a cue; not every beat needs a hit. Silence, breaks, and varying intensity are part of the direction. All tracks share a move vocabulary but differ in arrangement, camera presets, and lighting color script.

## Camera and effects rules

Maintain a clear screen direction and subject framing. Favor wide/medium combat shots; use close-ups only for prepared highlights. Keep the contact point visible, avoid clipping through models, and limit cuts/shake under reduced-motion mode. Effects emphasize hits without obscuring actors. Avoid saturated-red full-screen flashes.

The implemented director uses four front-side shot families: low-angle, closer three-quarter, elevated, and shoulder-side. Shots transition over 1.6 beats at eight-beat boundaries, following the active pair while preserving screen direction. Heavy attacks get a short push-in and small contact shake; portrait uses additional distance. Reduced Motion fixes a wide camera, removes moving slash/shard/dash effects and beam sweeps, and softens the scarf. Reduced Flash lowers effect opacity; there are no full-screen impact flashes. Pausing freezes camera, actors, effects, DJ, and lights on the song clock. Owner approval and full-track shot/contact review remain open.

## UI

Menu: track cards with play preview, title, credit, duration, mood, and selected state. Fight overlay: track name, progress, pause, mute/volume, settings, exit, and a restrained combo/status display. End screen: replay, choose track, and credits. On a small screen, prioritize transport and track visibility over decorative HUD.

## Definition of polished vertical slice

One original/cleared 60–120 second track, complete hero and opponent animation set, DJ, crowd, authored cues, readable camera, safe light script, mixed effects, and working failure/accessibility states. A looping idle scene or beat-reactive light show alone does not pass.

## Current owner-requested repertoire and human venue
Fifty stylized techniques span boxing, karate, Muay Thai, taekwondo, kung fu/Wing Chun, capoeira, judo-inspired throws, and fictional jutsu. The HUD names the current technique; the move book lists all 50. Blended recovery, chamber/retraction, support-foot targets, contact heights, and paired tumble reactions address the repeated rigidity feedback. These are game adaptations rather than authentic martial-arts instruction; final visual approval remains open.
The DJ and audience now use human models instead of primitive silhouettes. The DJ wears headphones and leans over the decks. Audience members have varied shirts/proportions/hair and staggered claps, raised arms, and fist pumps. Low quality uses 8 people; High uses 14. A wider floor supports audience placement. Reduced Motion holds the audience still; pause freezes venue animation. They share one base mesh/face, so unique character designs remain open.
