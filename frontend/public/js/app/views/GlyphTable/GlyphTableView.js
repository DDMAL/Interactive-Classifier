import _ from "underscore";
import $ from "jquery";
import Marionette from "marionette";
import GlyphTableRowView from "views/GlyphTable/Row/GlyphTableRowView";
import GlyphEvents from "events/GlyphEvents";
import RadioChannels from "radio/RadioChannels";

export default Marionette.CollectionView.extend({
    tagName: 'table class="table table-hover"',
    childView: GlyphTableRowView,

    isMouseDown: false,
    mouseDownX: 0,
    mouseDownY: 0,
    selectionBox: undefined,
    resizeEvent: undefined,

    ui: {
        "selectionBox": ".selection-box"
    },

    events: {
        "mousedown": "onMouseDown"
    },

    initialize: function ()
    {
        var prevViewModelSet = [];
        var clearPrevViewModels = function ()
        {
            _.each(prevViewModelSet, function (vm)
            {
                vm.deactivate();
            });
        };

        var that = this;
        this.listenTo(RadioChannels.edit, GlyphEvents.openGlyphEdit,
            function (model, viewModel)
            {
                clearPrevViewModels();
                // Activate the view so that it turns blue
                viewModel.activate();
                prevViewModelSet = [viewModel];

                // Clear the internal collection
                var collection = that.model.get("selection");
                collection.reset();
                collection.add(model);
            }
        );
    },

    onMouseDown: function (event)
    {
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

    onMouseUp: function (event)
    {
        console.log("onMouseUp()");
        if (this.isMouseDown === true)
        {
            // console.log(event);
            this.isMouseDown = false;
            var x = event.clientX,
                y = event.clientY;

            var width = Math.abs(x - this.mouseDownX),
                height = Math.abs(y - this.mouseDownY);

            var that = this;
            if (width !== 0 && height !== 0 && (width * height) > 10)
            {
                var boundingBox = {
                    left: Math.min(that.mouseDownX, x),
                    top: Math.min(that.mouseDownY, y),
                    right: Math.max(that.mouseDownX, x),
                    bottom: Math.max(that.mouseDownY, y)
                };

                // Empty the previous selection
                var collection = this.model.get("selection");

                // If the user holds shift, then this selection is an additional selection
                var isAdditional = event.shiftKey === true;
                console.log(isAdditional);

                if (!isAdditional)
                {
                    collection.reset();
                }

                RadioChannels.edit.trigger(
                    GlyphEvents.dragSelect,
                    boundingBox,
                    collection,
                    isAdditional // If the shift key is held, then it's an "additional" selection!
                );
            }
        }

        // Delete the selection box from the DOM
        this.selectionBox.style.visibility = "hidden";
    },

    childViewOptions: function ()
    {
        return {
            tableViewModel: this.model
        }
    },

    getAllGlypItemViews: function ()
    {
        var collection = [];
        this.children.each(function (view)
        {
            collection.push(view.model.get("glyphs"));
        });
        return collection;
    },

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
