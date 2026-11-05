# BookingSolved appointment-buffer demonstration

The screen recording shows the live public web calculator for a 09:00–12:00 shift with 30-minute appointments, a zero or ten-minute gap, and no final buffer. It contains no native app footage, audio, or customer data.

For the same reference version, use the built calculator HTML from gh-pages before this video was added (SHA-256 fa4f0d841df983bceaa26b8c99e818150fffb8fe98f5e86336a6c7e08f782514). Put it at public.html in a work directory. capture.cjs drives the real form through Chromium and verifies the resulting schedules before saving the screen frames. compose.py uses those frames as editorial cuts with permanent captions and writes the WebVTT, poster and silent H.264 MP4. No stock visuals are used.

Dependencies: Node, Playwright with Chromium (set CAPTURE_CHROME and CODEX_PRIMARY_RUNTIME_NODE_MODULES), Python with Pillow, ffmpeg/libx264, and DejaVu Sans. Run node capture.cjs /path/to/work then python compose.py /path/to/work. The capture blocks unrelated remote images for a deterministic replay of the self-contained calculator. Never reuse real client details in recordings.
