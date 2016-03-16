import GlobalVars from "config/GlobalVars";

/**
 * Get the absolute url for a given glyph id.
 *
 * @static
 * @param id {int}
 * @returns {string}
 */
export function getAbsoluteGlyphUrl(id)
{
    return GlobalVars.SITE_URL + "glyph/" + String(parseInt(id)) + "/";
}