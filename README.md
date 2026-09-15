# 3D Building Configurator

## Setup (do this once)

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## What you'll see

- Your `building.glb` model, auto-rotating.
- "Pause Rotation" button top-left.
- Click any part of the building → a floor plan image opens full-screen.
  Right now every section opens the same fallback plan
  (`public/plans/full-plan.jpg`, the Tomales Bay plan you provided).

## Wiring up individual room plans

1. Open the browser console (F12 → Console tab).
2. Click on different parts of the building model.
3. Each click logs the exact mesh name, e.g. `Clicked mesh: Bedroom2_Mesh`.
4. Open `src/App.jsx` and add that name to `planMap`:

```js
const planMap = {
  Bedroom2_Mesh: '/plans/bedroom2.jpg',
  PrimaryBedroom_Mesh: '/plans/primary-bedroom.jpg',
};
```

5. Put the matching floor plan image for each room inside `public/plans/`.
6. Save — the dev server hot-reloads automatically.

If your GLB's meshes aren't individually named (e.g. everything is one
single mesh), clicking won't be able to distinguish rooms. In that case
the model needs to be re-exported from Blender/whatever tool made it,
with each room as a separately named mesh or object.

## Folder structure

```
interactive-3d-building/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── models/
│   │   └── building.glb
│   └── plans/
│       └── full-plan.jpg
└── src/
    ├── main.jsx
    ├── App.jsx
    └── components/
        └── BuildingModel.jsx
```
