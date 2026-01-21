# Infinite Cube

## Instructions

Start dragging in order to remove the instructions. Press the **H** key to toggle instructions visibility.

### Keyboard Shortcuts

- **H** - Toggle instructions visibility
- **Q** - Cycle through all Block Style rendering styles
- **Z** - Toggle opacity for the relevant block styling
- **W** - Clear the Width/Height/Depth (WHD) parameterization
- **1-5** - Show/Hide specific dimension parameterization clones (only works in Dimension Parameterization mode)
- **A** - Show all dimension parameterization clones
- **S** - Hide all dimension parameterization clones
- **D** - Toggle dimension lines visibility

### Mouse Controls

- **Mouse Drag** - Manually rotate the cube in 3D space
- **Scroll** - Zoom in/out
- **Right-click + drag** - Pan the camera view

### Functionality Overview

This project implements an infinite/impossible cube visualization with interactive controls. The cube features parametric dimension control allowing you to adjust its appearance in real-time.

#### Dependencies

The project uses two main dependencies:

1. **three.js** - A 3D graphics library that handles the rendering and animation of the cube in WebGL
2. **lil-gui** - A lightweight GUI framework that provides the control panel for adjusting cube parameters

#### Parameterization

The cube supports two types of parameterization that can be selected in the **Block Rendering** section under the  **Block Style** dropdown:

1. **Width/Height/Depth (WHD) Parameterization** - Controls the three orthogonal dimensions (width, height, and depth) of the cube structure. This allows you to adjust the cube's proportions along the X, Y, and Z axes independently.

2. **Dimension Parameterization** - Controls alternative dimension parameters for the cube edges and segments. In this mode, you can use keys 1-5 to show/hide specific clones, key A to show all clones, and visualize the cube's three.js close construction method. This parameterization was inspired by the YouTube video linked below.

**Dynamic Control Panel:** When you change the Block Style, the relevant parameterization controls are automatically shown, and the unused parameterization controls are hidden.

**Persistent State:** Your parameterization selection and all parameter values are automatically saved and restored when you reload the page, ensuring your configuration is never lost.

**Reset Actions:** The Actions folder contains options to clear your saved parameterization state if needed, allowing you to start fresh with default values.

---

## Reference

[Nice YouTube build](https://www.youtube.com/watch?v=hBBkVgotIH8)

- Video name: DIY Impossible Cube/ Infinity Cube 自製無限立方 (DIY/Wood Working/Laser Cutting)
- Channel name: Coffreedom
- Channel handle: @coffreedom9247
