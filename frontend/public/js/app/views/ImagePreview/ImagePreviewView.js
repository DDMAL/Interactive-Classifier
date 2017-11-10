import $ from "jquery";
import Marionette from "marionette";
import GlyphEvents from "events/GlyphEvents";
import PageEvents from "events/PageEvents";
import template from "./image-preview.template.html";
import RadioChannels from "radio/RadioChannels";
// import GlyphCollection from "collections/GlyphCollection";

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
        isSlider: false,

        /**
         * selectionBox is the blue lasso that appears when the user clicks and
         * drags their mouse.
         */
        selectionBox: undefined,

        resizeEvent: undefined,

        events: {
            "mousedown": "onMouseDown"
        },

        ui: {
            "selectionBox": ".selection-box",
            highlight: ".preview-highlight"
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
            while (elems.length > 0)
            {
                var elem = elems[0];
                elem.parentNode.removeChild(elem);
            }

            for (var i = 0; i < glyphs.length; i++)
            {
                var glyph = glyphs[i];
                var pic = document.getElementsByClassName("preview-background")[0];
                var zoomLevel = pic.getBoundingClientRect().height / pic.dataset.originalHeight;

                var top = (glyph.get("uly")) * zoomLevel;
                var left = (glyph.get("ulx")) * zoomLevel;
                var width = glyph.get("ncols") * zoomLevel;
                var height = glyph.get("nrows") * zoomLevel;

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

            if (glyphs.length > 0)
            {
                // Scroll to the highlight of the first selected glyph
                elems = document.getElementsByClassName("preview-highlight");

                // If the user selected the glyph from the preview image, the page won't shift
                // If the user is zooming, then it will stay scroll to the highlighted glyph
                if (!this.isHover || this.isSlider)
                {
                    elems[0].scrollIntoView();
                }
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

            this.isMouseDown = true;
            this.mouseDownX = event.clientX;
            this.mouseDownY = event.clientY;

            if (!this.isSlider)
            {
                event.preventDefault();
                this.selectionBox.style.top = this.mouseDownY + "px";
                this.selectionBox.style.left = this.mouseDownX + "px";
                this.selectionBox.style.width = "0px";
                this.selectionBox.style.height = "0px";
                this.selectionBox.style.visibility = "visible";
            }
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
            if (this.isSlider && this.isMouseDown === true) // If the coords of the click are on the slider
            {
                var value = document.getElementById("s1").value;
                RadioChannels.edit.trigger(PageEvents.zoom, value);
                RadioChannels.edit.trigger(GlyphEvents.openMultiEdit);
                console.log("MouseUp!");
                this.isMouseDown = false;
            }
            else if (this.isMouseDown === true)
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
                    // have been selected.

                    var pageBounds = document.getElementsByClassName("preview-background")[0].getBoundingClientRect();
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

            var slider = document.getElementById("zoom-slider");
            var outer = document.getElementById("right2").getClientRects()[0]
            var left = outer.width + outer.left - slider.style.width.split("px")[0] - 30;
            var top = outer.top + outer.height - 35;
            slider.style.left = left + "px";
            slider.style.top = top + "px";

            // This slider corresponds to the glyph zoom
            var outer2 = document.getElementById("right2").getClientRects()[0];
            var slider2 = document.getElementById("glyph-zoom");
            slider2.style.left = left + "px";
            slider2.style.top = outer2.top - 35 + "px";

            var pic = document.getElementsByClassName("preview-background")[0];

            var that = this;
            $(document).keypress(function (event)
            {
                var slider = document.getElementById("s1");
                var value = slider.value;
                // If the user's mouse is hovering over the window, then = and - act as hotkeys
                // This is so the user can still user = and - when classifying glpyhs.
                if (that.isHover)
                {
                    if (event.key === "=")
                    {
                        var newVal = value * 1.1;
                        slider.value = newVal;
                        RadioChannels.edit.trigger(PageEvents.zoom, newVal);
                    }
                    else if (event.key === "-")
                    {
                        newVal = value / 1.1;
                        slider.value = newVal;
                        RadioChannels.edit.trigger(PageEvents.zoom, newVal);
                    }
                }
            });

            $(document).mousemove(function (event)
            {
                this.mouseDownX = event.clientX;
                this.mouseDownY = event.clientY;

                // This section checks whether or not the cursor is on one of the zoom sliders
                var zoom = document.getElementById("zoom-slider");
                var left = parseInt(zoom.style.left.split("px")[0]);
                var top = parseInt(zoom.style.top.split("px")[0]);
                var width = parseInt(zoom.style.width.split("px")[0]);

                var xBounds = this.mouseDownX > left && this.mouseDownX < (left + width);
                var yBounds = this.mouseDownY > (top - 20) && this.mouseDownY < (top + 20);

                var zoom2 = document.getElementById("glyph-zoom");
                var left2 = parseInt(zoom2.style.left.split("px")[0]);
                var top2 = parseInt(zoom2.style.top.split("px")[0]);
                var width2 = parseInt(zoom2.style.width.split("px")[0]);

                var xBounds2 = this.mouseDownX > left2 && this.mouseDownX < (left2 + width2);
                var yBounds2 = this.mouseDownY > (top2 - 20) && this.mouseDownY < (top2 + 20);

                that.isSlider = (xBounds && yBounds || xBounds2 && yBounds2);

                // This makes sure that the height isn't stored before the image exists
                // So it's not set to 0
                if (pic.style.height === "" || pic.style.height === "0px")
                {
                    pic = document.getElementsByClassName("preview-background")[0];
                    var h = pic.getClientRects()[0].height;
                    // Don't assign the height if h==0
                    if (h !== 0)
                    {
                        pic.style.height = h + "px";
                        pic.dataset.originalHeight = h;
                    }
                }
                // jscs:disable
                that.isHover = (event.clientX > document.getElementById("right2").getClientRects()[0].left && event.clientY > document.getElementById("right2").getClientRects()[0].top);
                // jscs:enable
                if (that.isMouseDown === true)
                {
                    // If the user has stopped holding their mouse down, execute
                    // the onMouseUp() procedure.

                    if (event.buttons === 0)
                    {
                        that.onMouseUp(event);
                    }
                    else if (that.isSlider) // If the coords of the click are on the slider
                    {
                        var value = document.getElementById("s1").value;
                        var value2 = parseInt(document.getElementById("s2").value) / 100;
                        RadioChannels.edit.trigger(PageEvents.zoom, value);
                        RadioChannels.edit.trigger(GlyphEvents.zoomGlyphs, value2);
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