# Todd without wristwatch

Active photo-based source set selected October 15, 2026: idle (5 frames), walk (5), straight punch (5), and the corrected Side kick (9). The original seven-frame kick is superseded and excluded from the active gallery. Originals remain in their historical source folders.

The PixelLab subscriber pixel workbench applied exact expected-color patches to inspected wrist regions, replacing the watch with nearby skin shades. No generative redraw or additional generations were used. Balance remained 4,996. `manifest.json` records original paths, tool IDs, cost, dimensions and changed-pixel counts; the two decision JSON files record exact patches. The source and edited atlases retain every frame at its original position and scale. Individual PNGs were extracted using `atlas-layout.json`, not inferred from silhouettes.

Validation compared every original and edited RGBA pixel: all alpha values are identical, and all 1,021 changed pixels belong to the recorded wrist patches. Dimensions, frame count, silhouette and foot baseline remain unchanged. One punch frame had no visible watch and is unchanged. Enlarged wrist inspection prompted a second free pass on residual band edges. Tattoo artwork remains visible; wrist-area shading has been locally repainted.

Use `idle-0.png` here as the watchless starting reference for future south-west generation. The remote character's original rotations and clips are historical and still include watches; reusing them without a watchless custom start could reintroduce it. Other directions have not been edited.

`node scripts/preview-todd-pixellab.mjs` rebuilds the active four-clip gallery at `../photo-character/animation-preview.html`. The old side-by-side kick review remains a historical comparison. This set is source art only; gameplay integration and runtime validation remain pending.
