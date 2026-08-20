# Goal
Perfect the "Majesty" presentation pose on the two 3D robots in the Hero section. 

## Target Pose ("Your Majesty" Welcome)
**Reference Images:** Please review `image.png` and `image copy.png` in the project root folder. These images visually demonstrate the exact pose you must replicate.

We want both robots flanking the central text to pose like welcoming butlers to the user.
* **Torso/Posture**: The robots should be bowing forward slightly (`torso.rotation.x`).
* **Orientation**: The robots should pivot their upper bodies inward to face the center text (`torso.rotation.y`).
* **Heads**: Even though their bodies are turned inward, their heads should turn slightly backward (`head.rotation.y`) to maintain eye contact with the user (the camera).
* **Inner Arms (Presenting)**: The arm closest to the center text (Left Robot's Right Arm, Right Robot's Left Arm) should extend forward and upward slightly, with a twist on the upper arm so the palm faces up, as if presenting the text to the user.
* **Outer Arms (Behind Back)**: The arm furthest from the center text should be swung backward and the elbow should bend so the forearm rests behind the lower back.

## Where to implement this
All 3D logic and animations are handled in `src/components/RobotSection.jsx`.
Look specifically for the **`gsap.timeline()`** section (around line ~400, "phase 3" and "phase 4") where the final resting poses are set using `.to()`.
You will also need to update the `micro-float` logic in the render loop at the bottom of `RobotSection.jsx` to ensure their continuous breathing animation doesn't snap them out of your new base rotations.

## Important Note on Joints & Clipping
The joints are extremely simple. If you try to rotate an arm horizontally across the robot's wide torso (using `z` rotation), it will almost certainly clip straight through the mesh.
**The best way to orient the arms inward without clipping is to rotate the entire torso (`torso.rotation.y`) to face the center** and then simply swing the arms forward (`x` rotation).
* Also remember: Bending the elbow forward requires a **negative `x`** rotation on the forearm pivot (`fP.rotation.x`).

## Visual Verification Steps (Required)
Since this is a highly visual 3D task, you MUST verify your rotations visually.
1. Start the local development server: run `npm run dev` in the terminal.
2. Open your built-in browser (or launch a headless instance) and navigate to `http://localhost:5173`.
3. The robots have an intro animation timeline. You must wait ~4-5 seconds for the animation to finish settling into the final "presentation" pose.
4. **Take a screenshot** of the browser.
5. Visually inspect the screenshot. Are the robots clipping through themselves? Are the elbows bending backward like broken action figures? 
6. If the pose is incorrect or glitchy, adjust the GSAP values in `RobotSection.jsx` and repeat the screenshot process until they look perfectly majestic and welcoming.
