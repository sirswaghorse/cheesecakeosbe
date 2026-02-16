// HippoStats Reporter v1.0
// Place this script in any prim in your Second Life or Kitely region.
// It will periodically send region statistics to your HorseshoeOS dashboard.
//
// SETUP: Replace YOUR_ENDPOINT_URL below with the URL shown in the Hippo Stats app.

string ENDPOINT_URL = "YOUR_ENDPOINT_URL";
float INTERVAL = 30.0; // seconds between reports

default
{
    state_entry()
    {
        llSetTimerEvent(INTERVAL);
        llOwnerSay("HippoStats Reporter started. Reporting every " + (string)((integer)INTERVAL) + " seconds.");
    }

    timer()
    {
        list stats = llGetRegionDetails([
            REGION_DETAILS_NAME,
            REGION_DETAILS_PRODUCT_SKU,
            REGION_DETAILS_PRODUCT_NAME
        ]);

        string regionName  = llList2String(stats, 0);
        string productSku  = llList2String(stats, 1);
        string productName = llList2String(stats, 2);

        float fps        = llGetRegionFPS();
        float timeDil    = llGetRegionTimeDilation();
        integer agents   = llGetRegionAgentCount();
        vector  wind     = llWind(ZERO_VECTOR);
        vector  sunDir   = llGetSunDirection();
        float   simTime  = llGetTimeOfDay();

        string body = llList2Json(JSON_OBJECT, [
            "region_name",   regionName,
            "product_sku",   productSku,
            "product_name",  productName,
            "fps",           (string)fps,
            "time_dilation",  (string)timeDil,
            "agents",        (string)agents,
            "wind_x",        (string)wind.x,
            "wind_y",        (string)wind.y,
            "wind_z",        (string)wind.z,
            "sun_dir_x",     (string)sunDir.x,
            "sun_dir_y",     (string)sunDir.y,
            "sun_dir_z",     (string)sunDir.z,
            "sim_time",      (string)simTime
        ]);

        llHTTPRequest(ENDPOINT_URL, [
            HTTP_METHOD, "POST",
            HTTP_MIMETYPE, "application/json"
        ], body);
    }

    http_response(key req, integer status, list meta, string body)
    {
        if (status != 200)
        {
            llOwnerSay("HippoStats: Error " + (string)status);
        }
    }

    on_rez(integer start_param)
    {
        llResetScript();
    }

    changed(integer change)
    {
        if (change & CHANGED_REGION_START)
        {
            llResetScript();
        }
    }
}
