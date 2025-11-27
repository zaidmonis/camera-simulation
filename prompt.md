You are an AI software engineer tasked with building a **production-grade React web application** for planning sports photography at a specific real-world event.

You have full freedom to:
- Use **React** (with TypeScript preferred).
- Use any **public NPM libraries** you deem appropriate (UI kits, state management, charts, 3D/canvas, etc.).
- Organize the project in a clean, scalable way.
- Commit and push the final code to a **public Git repository** here: `https://github.com/zaidmonis/camera-simulation.git`. 

Your job is to:
1. **Plan** the architecture. Keep the initial plan in a 'plan.md' file in the same repo, with all diagrams, decisions etc. 
2. **Implement** the app.
3. **Set up tooling** (build, lint, format, basic tests).
4. **Push** the project to the given Git repository.
5. **Document** the project, and put it in a readme. 

Everything below is the product spec and context. Follow it carefully.

---

## 1. CONTEXT: MY USE CASE

I am a sports photographer planning to shoot **Lacrosse Sixes** at:

- Event: **Kuala Lumpur Friendly Series (KLFS 2025)**  
- Sport: **Lacrosse Sixes**  
- Dates: **Dec 5–7, 2025**  
- Venue: **National Hockey Stadium, Bukit Jalil, Kuala Lumpur**  
- Field size: approximate international hockey field: **91.4 m × 55 m**  

Key characteristics:
- Large field
- Fast transitions
- Action frequently happens far from the photographer
- I need to pre-visualize lens reach, subject size in frame, and exposure needs

---

## 2. MY CAMERA GEAR

**Camera body:**
- Canon R6 Mark II (full-frame)

**Lens I own:**
- EF 70–200mm f/2.8L IS II (via EF–RF adapter)

**Lenses I might rent (assume similar rental price):**
- EF 100–400mm f/4.5–5.6L IS II
- RF 200–800mm f/6.3–9

This app is intended to help me:
- Decide **which lens to rent**.
- Determine **where to stand** on the field.
- Predict **how large players will appear in the frame** at various focal lengths.
- Simulate **exposure and ISO behavior** under different lighting conditions.

---

## 3. HIGH-LEVEL APP GOAL

Build an **interactive React web application** that:

- Shows a **top-down view** of the National Hockey Stadium field.
- Lets me drag a **camera position** around the perimeter.
- Lets me drag one or more **player positions** within the field.
- Simulates:
  - **Focal length effects** (field of view & frame fill).
  - **Exposure** (aperture, shutter speed, lighting conditions → ISO).
  - **Subject rendering** using **stick figures / figurines / sample sports photos** to visualize framing and brightness.
- Supports **Auto ISO** (correct exposure simulation) and **Manual ISO** (simulate current exposure outcome: under/over-exposed).
- Allows pre-assessment of different **lenses, locations, and conditions** before the actual event.

---

## 4. TECHNICAL REQUIREMENTS

### 4.1 Stack & Structure

- Use **React** with **TypeScript**.
- Use a modern build tool:
  - Prefer **Vite** + React + TypeScript OR
  - Next.js with app router (if you think SSR/SEO will help, but SPA is acceptable).
- State management:
  - You may use tools like Redux, Zustand, Jotai, or React Context where appropriate.
- UI:
  - You may use a component library (e.g. MUI, Chakra UI, Ant Design) or styled-components / TailwindCSS.
- Visualization:
  - For field and positions, you can use SVG or canvas (e.g. `react-konva`, `d3`, or plain SVG).
  - For figurines / stick figures, use SVG shapes, simple 2D sprites, or small embedded assets.

### 4.2 Repo & Tooling

- Initialize a **clean Git repository** locally.
- Set up:
  - ESLint (TypeScript support).
  - Prettier.
  - Basic testing (e.g. Jest + React Testing Library or Vitest).
- Add a **README.md** with:
  - Setup instructions.
  - Build & run commands.
  - Short explanation of features.
- When done, push the code to:  
  `git remote add origin <REPO_URL_HERE>`  
  `git push -u origin main`  
  (or the appropriate default branch like `master` if needed).

---

## 5. CORE FEATURES

### 5.1 Field Visualization

- Represent the full **91.4 m × 55 m** field in a **top-down 2D view**.
- Show:
  - Field boundary.
  - Center line.
  - Goals / end zones.
  - Optional: basic lacrosse sixes markings (simplified is fine).
- Implement **coordinate mapping**: each pixel maps to a real-world position in meters.

### 5.2 Camera Position (Interactive)

- Show a **camera icon** (or multiple future cameras) that can be:
  - Dragged along the sidelines and behind goals.
  - Optionally constrained to outside the field boundary.
- While dragging, update:
  - Its real-world coordinates.
  - Distances to players.

### 5.3 Player Position(s) (Interactive)

- Represent one or more **players** with icons:
  - A default human-sized stick figure / figurine.
  - Height assumption: **1.8 m** (configurable in UI).
- Players must be draggable inside the field.
- Show at least:
  - One main “target” player with metrics.
  - Optionally, support multiple players (e.g., offense/defense).

### 5.4 Distance & Geometry

For each camera–player pairing:

- Compute Euclidean distance in meters.
- Display:
  - Numeric distance.
  - Optionally, a line drawn between camera and player.
- This distance, plus focal length, drives the FOV and frame-fill calculations.

---

## 6. LENS & FOV SIMULATION

### 6.1 Focal Length Selection

Provide a **lens & focal length control panel**, including:

- Lens presets:
  - EF 70–200mm f/2.8
  - EF 100–400mm f/4.5–5.6
  - RF 200–800mm f/6.3–9
- For each lens:
  - Allow focal length selection via slider and/or discrete buttons:
    - 70, 100, 135, 200, 300, 400, 600, 800 mm
  - Only enable focal lengths valid for the selected lens.

### 6.2 Field of View & Frame-Fill

Assume:
- Camera: **full-frame** (e.g. 36 x 24 mm sensor).
- Player approximate height: **1.8 m** (user-adjustable).

For current camera–player distance and chosen focal length:

- Compute:
  - Horizontal FOV.
  - Vertical FOV.
  - Percentage of frame height occupied by the player (subject height / scene height).
- Display:
  - Numeric frame-fill %.
  - A **frame preview widget**:
    - A rectangle representing the image frame.
    - A stick figure / silhouette inside, scaled according to frame-fill.

---

## 7. EXPOSURE & ISO SIMULATION

### 7.1 Controls

Provide a panel with:

- **Mode selection**:
  - Auto ISO (correct exposure).
  - Manual ISO (simulate exposure with chosen ISO).

- **Aperture**:
  - Must reflect lens constraints:
    - 70–200: f/2.8–f/22 (approx).
    - 100–400: f/4.5–5.6 at wide/tele, with relevant range.
    - 200–800: f/6.3–9 at wide/tele, with relevant range.
  - UI can approximate behavior or simplify, but be reasonable.

- **Shutter speed**:
  - Default: **1/1000 s**.
  - Range: at least 1/250 s to 1/2000 s, selectable.

- **Lighting condition presets**, each mapped to an EV (at ISO 100):
  - Bright sunny daylight – EV 15
  - Overcast daylight – EV 13
  - Heavy overcast – EV 12
  - Evening golden hour – EV 10.5
  - Bright stadium lights – EV 10
  - Average stadium lights – EV 9
  - Poor stadium lights – EV 8

- **ISO**:
  - In Manual mode:
    - User can set ISO (100–51200 at least).
  - In Auto mode:
    - ISO is computed from EV, aperture, and shutter.

### 7.2 Exposure Math

Use the standard equation:

- EV at ISO 100:  
  `EV = log2(N^2 / t)`  

- Extended ISO form:  
  `EV = log2(N^2 / t) - log2(ISO / 100)`

Where:
- `EV` is from lighting preset.
- `N` is aperture.
- `t` is shutter time in seconds.

#### Auto ISO mode:
- Given EV, N, and t, compute ISO:
  - `ISO = 100 * 2^(log2(N^2 / t) - EV)`
- Clamp / round to standard ISO values.
- Show warnings if ISO > 12800 or some threshold.

#### Manual ISO mode:
- Given EV, N, t, and user ISO:
  - Compute the **exposure difference** in stops from “correct” exposure.
  - Indicate:
    - Underexposed / overexposed.
    - By how many stops.
  - Reflect this visually in the preview frame (e.g. dimmer/brighter simulation).

---

## 8. VISUAL PREVIEW WITH FIGURINES / PHOTOS

Create a **visual preview panel** that:

- Shows a **mock image frame** (simulated view through the lens).
- Inside:
  - Use a **stick figure, silhouette, or simple sports figure** representing the player at the selected frame-fill percentage.
  - Optionally overlay a subtle background (e.g. blurred field image, gradient representing turf).
- Use exposure simulation:
  - In Auto ISO, show a “properly exposed” version.
  - In Manual ISO, adjust brightness to indicate under/overexposure.
- If feasible:
  - Offer a toggle between:
    - Stylized stick figure mode.
    - Optional sample sports photo scaled + darkened/lightened.

The goal is not photorealistic rendering but intuitive feedback:
- “This is how big they’ll look.”
- “This is how bright/dark it’ll be.”

---

## 9. EXTRA FEATURES (IF TIME/BUDGET ALLOWS)

These are **nice-to-haves**, do them if they are reasonable:

1. **Scenario presets**:
   - Save scenarios (camera position, lens, focal length, exposure settings).
   - Load them quickly.
   - Example: “Far sideline, 400mm, overcast, 1/1000s”.

2. **Multiplayer support**:
   - Multiple players with labels (e.g. “Attacker”, “Goalie”).
   - Quickly switch which player is used for frame-fill preview.

3. **Lens comparison mode**:
   - Side-by-side view of two different lenses or focal lengths at same positions.

4. **Device responsiveness**:
   - Usable on desktop primarily.
   - Readable and partially usable on tablet.

5. **Simple analytics panel**:
   - Min/max distances.
   - Lens usage recommendations (e.g. “At this position, 400mm is borderline; 600–800mm recommended”).

---

## 10. UX & DESIGN

- Aim for a clean, photographer-friendly UI.
- Group controls clearly:
  - “Field & Positions”
  - “Lens & Camera”
  - “Exposure & Lighting”
  - “Preview & Analysis”
- Make sure key metrics are always visible:
  - Distance (m)
  - Focal length (mm)
  - Frame fill (%)
  - Aperture
  - Shutter speed
  - ISO
  - Exposure mode (Auto / Manual)
  - Lighting condition

---

## 11. IMPLEMENTATION STEPS (AGENTIC BEHAVIOR)

You should operate agentically as follows:

1. **Planning phase**:
   - Decide stack (e.g. Vite + React + TS).
   - Decide state management and UI libraries.
   - Sketch components and app structure.

2. **Project setup**:
   - Initialize the React project.
   - Configure TypeScript, ESLint, Prettier, basic tests.
   - Set up sensible scripts in `package.json`.

3. **Core functionality implementation**:
   - Implement field, camera, players, and coordinate system.
   - Implement FOV & frame-fill computations.
   - Implement exposure engine (Auto / Manual ISO).
   - Implement visual preview with figurines/silhouettes/sports imagery.
   - Keep everything scalable. Later, might need to add features like- add more camera types (APSC, medium format etc) or lens type(ultra wide, wide, superzoom etc) or even field(cricket field, football field etc).


4. **Refinement & UX**:
   - Add lens presets, lens constraints, and UI polishing.
   - Add validation and warnings where needed.

5. **Documentation & cleanup**:
   - Create a `README.md` with:
     - Overview.
     - How to install & run.
     - Explanation of controls & logic.
   - Ensure code is formatted and linted.

6. **Git & remote push**:
   - Create local Git repo.
   - Make logical commits along the way.
   - Add remote:
     - `git remote add origin <REPO_URL_HERE>`
   - Push final project:
     - `git push -u origin main` (or `master` if needed).

Make sure the repository is in a **ready-to-run** state using standard commands like:

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run test`

---

## 12. OUTPUT EXPECTATIONS

At the end, I expect:

- A **fully functional React app** that:
  - Runs locally.
  - Lets me drag camera & players on a scaled field.
  - Simulates FOV, frame-fill, and exposure.
  - Provides Auto and Manual ISO modes.
  - Uses figurines or simple visuals to simulate framing & brightness.

- All code pushed to the provided public Git repo:  
  `https://github.com/zaidmonis/camera-simulation.git`

This spec is comprehensive. Use it as your single source of truth while designing and coding the application.
