import Marionette from "marionette";
import GlyphView from "views/GlyphList/GlyphView";

import template from "./glyph-collection.template.html";

export default Marionette.CompositeView.extend({
    template,
    childView: GlyphView,
    childViewContainer: "tbody"
});