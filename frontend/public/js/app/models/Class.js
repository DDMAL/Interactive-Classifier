import Backbone from "backbone";
import GlyphEvents from "events/GlyphEvents";
import ClassEvents from "events/ClassEvents";
import RadioChannels from "radio/RadioChannels";
import ClassNameUtils from "utils/ClassNameUtils";
import Glyph from "./Glyph";

/**
 * A Glyph object within the interactive classifier.
 *
 * @class Glyph
 */
export default Backbone.Model.extend(
    /**
     * @lends Glyph.prototype
     */
    {

    defaults: {
            name: "",
            glyphs: [],
        },    	

    deleteClass: function ()
    {

    },

    addGlyph(glyph)
    {
        glyphs.push(glyph);
    },

    removeGlyph(glyph)
    {
        var index=glyphs.indexOf(glyph);
        glyphs.splice(index,1);
    }


    });