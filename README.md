# Directory Tree Generator (DTG)

A lightweight, single-file web app to model folder/file hierarchies with intuitive drag-and-drop, quick emoji labeling, and copy-ready tree output.

## 📋 Table of Contents
1. Overview  
2. Features  
3. ⚡ Quick Start  
4. 📁 Example of Usage  
5. 🛠️ Technical Details  
6. Roadmap  
7. Contributing  
8. License  
9. 🛸 Thank you

## Overview
Directory Tree Generator helps you design and communicate folder structures quickly. Drag items to reorder or nest, add folders/files at the root with one click, and export a clean text tree. It’s ideal for documentation, onboarding, project planning, and teaching.

## Features
- Drag-and-drop reordering and nesting with clear visual hints.  
- Root-level “drop zone” for quickly moving items back to top level.  
- Quick emoji picker to visually label folders and files.  
- Copy-ready “tree” text output with or without emojis.  
- English and Spanish builds with language switch buttons.  
- Pure HTML/CSS/JS—no build step required.

## ⚡ Quick Start
1) Download the HTML file(s): DTG-en.html and/or DTG-es.html.  
2) Open the file locally in your browser (double-click works).  
3) Use the buttons at the top to add folders/files at the root.  
4) Drag items to reorder or nest under folders.  
5) Toggle “Show emojis” and click “Copy” to grab the generated tree text.

Tip: Click “Load example” to populate a sample structure and explore the interactions.

## 📁 Example of Usage
Below is a sample structure you might generate with DTG and paste into documentation:

📂 My_first_project/
└── 📂 DTG_multi/
├── 📄 index.html
├── 📄 index_es.html
└── 📄 README.md
📂 My_future_project/
└── 📂 we_will_see/
└── 📄 thankyou.txt


## 🛠️ Technical Details

| Technology | Version | Role in the Code | Purpose |
| --- | --- | --- | --- |
| HTML5 | Single-file | Markup structure | Provides the app layout, controls, and output area. |
| CSS (Bootstrap + custom) | Bootstrap 5.3.x | Styling and layout | Delivers a clean, responsive UI; custom styles enhance DnD hints and inputs. |
| JavaScript (Vanilla) | ES6+ | App state and logic | Manages the tree model, drag-and-drop behavior, selection, and text generation. |
| Bootstrap Bundle | 5.3.x | UI components (no jQuery) | Provides lightweight components and utility classes, loaded via CDN. |
| Clipboard API (fallback to execCommand) | Browser API | Copy output | Copies the generated tree text to the clipboard reliably across browsers. |

### Implementation Highlights
- Virtual Root: A non-rendered virtual root holds all top-level items, simplifying insertions and reparenting.  
- Controlled Drag Start: Drags begin from the item header or the dedicated handle to avoid accidental drags while editing text.  
- Drop Zones: Insert before/after siblings or nest into folders (middle zone) with clear visual feedback.  
- Output Generation: A single function regenerates the text tree and respects the “Show emojis” toggle.

## Roadmap
- Local persistence (save/load JSON).  
- Import/export structures.  
- Keyboard shortcuts for power users.  
- Inline i18n toggling without page reload.  
- Optional file-type icons via extension inference.

## Contributing
Contributions are welcome! Please open an issue describing the enhancement or bug, then submit a PR with a concise description, test steps, and screenshots/GIFs where helpful.

## License
MIT. Feel free to use, modify, and distribute.

## 🛸 Thank you
Thanks for checking out Directory Tree Generator. May your folder structures be tidy and your documentation crystal clear.

Built and curated for humans by... 👽
