# Project Context for Fable

## Overview
This is a modern, premium 3D portfolio website for a developer/agency named "Mudassir" (formerly Faiq). The site features a dark mode aesthetic, heavy use of glassmorphism, dynamic scrolling parallax effects, and most importantly, a hero section featuring two 3D animated robots built entirely from scratch using raw Three.js primitives and GSAP timelines.

## Tech Stack
* **Framework**: React 18 (Vite)
* **Styling**: Vanilla CSS (`src/index.css`) with global variables and a custom utility class system.
* **3D Graphics**: `three` (Raw Three.js *NOT* react-three-fiber). 
* **Animations**: `gsap` (ScrollTrigger for scroll-linked animations, and standard GSAP timelines for 3D robot sequencing).
* **Scrolling**: `lenis` (for smooth scrolling).

## Key Files & Architecture
* **`src/data.json`**: Centralized data store. All text, testimonials, links, and content are pulled from this file. The site relies on this for easy content management.
* **`src/index.css`**: Contains CSS variables, resetting, layout constraints, typography, and all the styling for parallax background elements (e.g. `.parallax-bg`, `.bg-1` to `.bg-4`).
* **`src/App.jsx`**: The main layout wrapper. It initializes Lenis for smooth scrolling, sets up global GSAP scroll triggers for the floating parallax background orbs and grid cards, and renders the layout components.
* **`src/components/RobotSection.jsx`**: **The most critical file for 3D work.** 
  * It mounts a canvas and runs an `init3D()` function.
  * Inside `init3D`, it manually constructs two robots (`botL` and `botR`) using basic Three.js meshes (BoxGeometry, CylinderGeometry, SphereGeometry) and materials.
  * It creates hierarchical Groups for joints: `torso`, `head`, `uP` (upper arm pivot), and `fP` (forearm pivot).
  * It builds a `gsap.timeline()` that animates the robots dropping in, pausing, and settling into their final poses.
  * It has a render loop that adds continuous floating/breathing micro-animations via `Math.sin()` logic applied to the rotations on top of the GSAP base values.

## Important Gotchas
* **Coordinate System & Joints**: The robot arm joints are very rudimentary. The `uP` (upper arm pivot) rotates from the shoulder socket. The `fP` (forearm pivot) rotates from the elbow.
* **Rotation Direction**: Bending the elbow forward requires a **negative** `x` rotation on `fP` (e.g., `fP.rotation.x = -0.5`). A positive `x` rotation will bend the arm backward like a broken joint.
* **Clipping**: Because the torsos are wide, swinging arms directly inward across the chest (`z` rotation) often causes severe clipping into the mesh. The safest way to orient the robots is to rotate the entire `torso.rotation.y` to face the center, rather than dragging the arms across the body.
