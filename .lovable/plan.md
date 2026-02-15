

## LSL Script for Viewing HorseshoeOS in Second Life

### Overview
Create an LSL (Linden Scripting Language) script that uses Second Life's **Media on a Prim** feature to display your HorseshoeOS desktop on an in-world object. The script will be saved as a text file in the project's public documents area so you can easily copy it.

### How It Works
Second Life allows prims (objects) to display web pages using the `llSetPrimMediaParams` function. Your published site at `https://horseshoeos.lovable.app` will be loaded onto a prim face, effectively giving you a usable desktop inside Second Life.

### What Will Be Created

A new file `public/HorseshoeOS_Viewer.lsl` containing a script that:

- Sets up media-on-a-prim on touch or on rez
- Points to your published URL (`https://horseshoeos.lovable.app`)
- Configures the media to fill the prim face properly
- Includes auto-scaling and permissions setup
- Optionally sets the prim to fullbright so the display is clearly visible

### Usage Instructions (included in the script comments)
1. Create a prim in Second Life (a flat box works best)
2. Open the prim's Content tab
3. Create a new script and paste the LSL code
4. Touch the prim to activate the media display
5. Click the media surface to interact with HorseshoeOS

### Technical Details

The script will use:
- `llSetPrimMediaParams` to configure the web media
- `PRIM_MEDIA_CURRENT_URL` set to the published app URL
- `PRIM_MEDIA_AUTO_ZOOM` / `PRIM_MEDIA_AUTO_SCALE` for proper display
- `touch_start` event to initialize or refresh the media
- `PRIM_FULLBRIGHT` to make the screen visible without needing SL lighting

The file will be accessible at your preview/published URL under `/HorseshoeOS_Viewer.lsl` for easy download, or you can simply open it and copy the contents.

