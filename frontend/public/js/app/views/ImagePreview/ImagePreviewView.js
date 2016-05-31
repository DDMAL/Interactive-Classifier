import Marionette from "marionette";
import template from "./image-preview.template.html";

/**
 * @class ImagePreviewView
 *
 * This view displays the preview of the entire document page at the bottom right of the window.
 *
 * Calling highlightGlyph() draws a red highlight box over a particular glyph on the page.
 *
 * @constructs ImagePreviewView
 */
export default Marionette.ItemView.extend(
    /**
     * @lends ImagePreviewView.prototype
     */
    {
    template,

    ui: {
        highlight: ".preview-highlight"
    },

    /**
     * Draw a highlight box over a particular Glyph model that is on the page.
     *
     * @param {Glyph} glyph - A Glyph model.
     */
    highlightGlyph: function (glyph)
    {
        // Change the dimensions of our highlight box to match those of the
        // glyph.
        this.ui.highlight.css({
            top: glyph.get("uly"),
            left: glyph.get("ulx"),
            width: glyph.get("ncols"),
            height: glyph.get("nrows")
        });

        // Scroll to the highlight
        this.ui.highlight[0].scrollIntoView();
    }
});