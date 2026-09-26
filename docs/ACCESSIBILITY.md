# Accessibility and motion safety

## Target and design

Aim for WCAG 2.2 AA on the HTML controls, text, and navigation, with equivalent control over the WebGL experience where practical. The game is visual, but track selection, playback, pause, volume, settings, help, credits, and errors must remain operable outside the canvas.

- Safe default lighting: avoid full-screen strobes and verify all effects against WCAG's three-flash or threshold rule, including saturated red. Reduced Flash further softens effects; it is not the sole protection. [W3C flash criterion](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold).
- Read `prefers-reduced-motion` on first visit; reduce shake, quick camera moves, rapid cuts, crowd motion, particles, and floor movement. Provide a persistent override and Reset Preferences. [MDN reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion).
- Keyboard focus order and visible focus ring for every HTML control. Escape or a visible button should pause/exit the fight. No keyboard trap inside the canvas.
- Labels for track cards, play/pause, mute, sliders, and quality options. Do not encode score, danger, or state only by color. Use readable contrast and scalable text.
- Music and effects volume controls, mute, and text for key nonverbal cues. The fight starts only after an explicit user action.
- Offer pause at any moment. Show a short motion/lighting notice and settings before first playback.

## Verification

Run automated accessibility checks on menu, loading, game overlay, error, credits, and privacy views; then do keyboard and screen-reader manual passes. Record desktop/mobile contrast and zoom behavior. Capture representative segments from every track for flash assessment. Check reduced-motion mode across every animation path, not just the menu.

No release with an unsafe flash sequence, inaccessible Start/Pause controls, missing focus, or unreadable primary text. Document remaining limits of describing the 3D choreography and provide a concise text summary of the experience.
