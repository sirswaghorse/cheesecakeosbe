// ============================================
// HorseshoeOS Viewer for Second Life
// Media on a Prim - LSL Script
// ============================================
//
// USAGE INSTRUCTIONS:
// 1. Create a prim in Second Life (a flat box works best - try 0.01 x 3.0 x 2.0)
// 2. Right-click the prim > Build > Content tab
// 3. Click "New Script", delete the default code, and paste this entire script
// 4. Save the script and close the editor
// 5. Touch the prim to activate the HorseshoeOS display
// 6. Click the media surface to interact with the desktop
//
// TIP: For best results, use a 16:9 aspect ratio prim face.
//      Set the prim to Fullbright (Texture tab) if it looks dark.
// ============================================

string URL = "https://horseshoeos.lovable.app";
integer FACE = 0; // Front face of the prim

default
{
    state_entry()
    {
        // Make the display face fullbright so it's always visible
        llSetPrimitiveParams([
            PRIM_FULLBRIGHT, FACE, TRUE,
            PRIM_COLOR, FACE, <1.0, 1.0, 1.0>, 1.0
        ]);

        llOwnerSay("HorseshoeOS Viewer ready. Touch to activate display.");
    }

    on_rez(integer start_param)
    {
        llResetScript();
    }

    touch_start(integer total_number)
    {
        // Only the owner can activate/refresh the display
        if (llDetectedKey(0) != llGetOwner())
        {
            llSay(0, "Only the owner can control this display.");
            return;
        }

        // Clear any existing media first
        llClearPrimMedia(FACE);

        // Set up media on the prim face
        llSetPrimMediaParams(FACE, [
            PRIM_MEDIA_CURRENT_URL, URL,
            PRIM_MEDIA_HOME_URL, URL,
            PRIM_MEDIA_AUTO_SCALE, TRUE,
            PRIM_MEDIA_AUTO_ZOOM, TRUE,
            PRIM_MEDIA_PERMS_INTERACT, PRIM_MEDIA_PERM_ANYONE,
            PRIM_MEDIA_PERMS_CONTROL, PRIM_MEDIA_PERM_OWNER,
            PRIM_MEDIA_WIDTH_PIXELS, 1920,
            PRIM_MEDIA_HEIGHT_PIXELS, 1080
        ]);

        llOwnerSay("HorseshoeOS display activated! Click the surface to interact.");
    }
}
