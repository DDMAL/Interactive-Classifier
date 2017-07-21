import Marionette from "marionette";
import GlyphEvents from "events/GlyphEvents";
import template from "./image-preview.template.html";
import RadioChannels from "radio/RadioChannels";
import GlyphCollection from "collections/GlyphCollection";

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
        isMouseDown: false,
        mouseDownX: 0,
        mouseDownY: 0,

        /**
         * selectionBox is the blue lasso that appears when the user clicks and
         * drags their mouse.
         */
        selectionBox: undefined,

        resizeEvent: undefined,

        events: {
            "mousedown": "onMouseDown",
        },

        ui: {
            "selectionBox": ".selection-box",
            highlight: ".preview-highlight",
        },

        /**
         * Draw highlight boxes over the particular Glyph models that are on the page.
         *
         * @param {Glyph} glyphs - A collection of Glyph models.
         */
        highlightGlyph: function (glyphs)
        {
            // Change the dimensions of our highlight box to match those of the
            // glyph.


            // Getting rid of all the previously selected glyphs
            var elems = document.getElementsByClassName("preview-highlight");
            while(elems.length>0)
            {
                var elem = elems[0];
                elem.parentNode.removeChild(elem);
            }

            for(var i = 0; i < glyphs.length; i++)
            {
                var glyph = glyphs[i];

                var top = glyph.get("uly");
                var left = glyph.get("ulx");
                var width = glyph.get("ncols");
                var height = glyph.get("nrows");

                // Creating a box for each glyph
                var el = document.body.appendChild(document.createElement("div"));
                el.style = "top: " + top + "px; left: " + left + "px; width: " + width + "px; height: " + height + "px";
                el.style.background = "#d30505";
                el.style.position = "absolute";
                el.style.opacity = 0.4;
                el.style.filter = "alpha(opacity=40)"; // IE8
                el.style.visibility = "visible";
                el.className = 'preview-highlight';
                this.el.appendChild(el);
            }

            if(glyphs.length>0)
            {
                // Scroll to the highlight of the first selected glyph
                var elems = document.getElementsByClassName("preview-highlight");

                // TODO: If the glyph is in view, the page shouldn't scroll
                elems[0].scrollIntoView();
            }
        },

        /**
         * This function fires when the user clicks and holds their mouse down.
         * We record the location of the user's mouse and trigger the selectionBox
         * lasso to appear.
         *
         * @param event jQuery event object.
         */
        onMouseDown: function (event)
        {

            this.ui.highlight.css({
                top: 0,
                left: 0,
                width: 0,
                height: 0
            });

            event.preventDefault();
            this.isMouseDown = true;
            this.mouseDownX = event.clientX;
            this.mouseDownY = event.clientY;

            this.selectionBox.style.top = this.mouseDownY + "px";
            this.selectionBox.style.left = this.mouseDownX + "px";
            this.selectionBox.style.width = "0px";
            this.selectionBox.style.height = "0px";
            this.selectionBox.style.visibility = "visible";
        },

        /**
         * This function fires when the user who has been clicking and dragging
         * finally releases their mouse.
         *
         * This function triggers the logic to select whichever glyphs in the table
         * collide with the selectionBox.
         *
         * @param event jQuery event object.
         */
        onMouseUp: function (event)
        {
            if (this.isMouseDown === true)
            {
                console.log("MouseUp!");
                this.isMouseDown = false;
                var x = event.clientX,
                    y = event.clientY;

                var width = Math.abs(x - this.mouseDownX),
                    height = Math.abs(y - this.mouseDownY);

                var that = this;
                if (width !== 0 && height !== 0 && (width * height) > 10)
                {
                    // boundingBox is the dimensions of the drag selection.  We will
                    // use these dimensions to test whether or not individual glyphs

                    var pageBounds = this.el.getBoundingClientRect();

                    // have been selected.
                    var boundingBox = {
                        left: Math.min(that.mouseDownX, x) - pageBounds.left,
                        top: Math.min(that.mouseDownY, y) - pageBounds.top,
                        right: Math.max(that.mouseDownX, x) - pageBounds.left,
                        bottom: Math.max(that.mouseDownY, y) - pageBounds.top
                    };

                    // If the user holds shift, then this selection is an additional selection
                    var isAdditional = event.shiftKey === true;

                    if (!isAdditional)
                    {
                        RadioChannels.edit.trigger(GlyphEvents.deselectAllGlyphs);
                    }

                    // This is the event that triggers the GlyphMultiEditView to be
                    // opened.  This event is also listened to by GlyphTableItemView
                    // views, which check whether or not they collide with
                    // boundingBox.
                    RadioChannels.edit.trigger(
                        GlyphEvents.previewSelect,
                        boundingBox,
                        isAdditional // If the shift key is held, then it's an "additional" selection!
                    );
                    RadioChannels.edit.trigger(GlyphEvents.openMultiEdit);
                }
            }

            // Delete the selection box from the DOM
            this.selectionBox.style.visibility = "hidden";
        },

        /**
         * After the view is rendered, this function automatically constructs
         * the selectionBox as a hidden DOM element.
         *
         * This function also sets up an event listener which resizes the
         * selectionBox when the user moves their mouse.
         */
        onShow: function ()
        {
            this.selectionBox = document.body.appendChild(document.createElement("div"));
            this.selectionBox.style.background = "#337ab7";
            this.selectionBox.style.position = "absolute";
            this.selectionBox.style.opacity = 0.4;
            this.selectionBox.style.filter = "alpha(opacity=40)"; // IE8
            this.selectionBox.style.visibility = "hidden";

            var that = this;
            $(document).mousemove(function (event)
            {
                if (that.isMouseDown === true)
                {
                    // If the user has stopped holding their mouse down, execute
                    // the onMouseUp() procedure.
                    if (event.buttons === 0)
                    {
                        that.onMouseUp(event);
                    }
                    else
                    {
                        var x = event.pageX,
                            y = event.pageY;

                        that.selectionBox.style.left = Math.min(x, that.mouseDownX) + "px";
                        that.selectionBox.style.top = Math.min(y, that.mouseDownY) + "px";
                        that.selectionBox.style.width = Math.abs(x - that.mouseDownX) + "px";
                        that.selectionBox.style.height = Math.abs(y - that.mouseDownY) + "px";
                    }
                }
            });
        }

    });