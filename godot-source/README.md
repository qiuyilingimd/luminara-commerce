# Luminara 3D Cabinet

Godot 4.7.2 single-threaded Web scene. It is loaded only after the visitor
chooses **3D Room** or **Enter the 3D room**.

## Rebuild

Install the `4.7.2.stable` Web export template, then run:

```powershell
godot --headless --path . --export-release "Web" ../assets/godot/index.html
cd ..
node scripts/finalize-godot-export.cjs
```

The final bridge posts loading progress and scene-ready events to the parent
storefront. The exported directory is `../assets/godot/`.

## Controls

- Drag: orbit the camera within a restrained arc.
- Wheel or pinch: move closer or farther away.
- Idle: a slow camera drift keeps the objects alive without a pauses control.

The product planes use the actual Luminara texture cut-outs. The backdrop,
halo and contact-shadow textures are generated from the project's own assets.
