import Marionette from "marionette";
import template from "./image-preview.template.html";


export default Marionette.ItemView.extend({
    template,

    ui: {
        highlight: ".preview-highlight"
    },

    highlightGlyph: function (glyph)
    {
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