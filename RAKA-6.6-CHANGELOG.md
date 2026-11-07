# K-Pedia 6.6.0 — RAKA interaction repair

- Replaced the single low-resolution standing mascot with 12 individually cropped, transparent WebP expression assets derived from the approved RAKA expression sheet.
- Added expression switching for greeting, happy, thinking, searching, explaining, confused, surprised, apologetic, success, listening, encouraging, and idle.
- Added pointer-responsive parallax, CSS idle breathing/floating, speech bubble updates, and quick interaction controls.
- Login form now reacts to focus, typing, invalid credentials, lockout, and successful login.
- Added reduced-motion support and responsive layout.
- Animations use transform/opacity and are designed for a 60 FPS target; actual frame rate depends on browser/device and should be profiled on target hardware.

## Important
This remains a static-site front-end. It does not add a live generative AI backend; search-result feedback is driven by the existing K-Pedia local search engine.
