import _ from "underscore";
import $ from "jquery";
import Marionette from "marionette";
import GlyphTableRowView from "views/GlyphTable/Row/GlyphTableRowView";
import GlyphEvents from "events/GlyphEvents";
import RadioChannels from "../../radio/RadioChannels";

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
        // "mouseup": "onMouseUp"
    },

    initialize: function ()
    {
        var prevViewModelSet = [];
        var clearPrevViewModels = function ()
        {
            _.each(prevViewModelSet, function(vm)
            {
                vm.deactivate();
            });
        };

        this.listenTo(RadioChannels.edit, GlyphEvents.openGlyphEdit,
            function(model, viewModel)
            {
                clearPrevViewModels();
                // Activate the view so that it turns blue
                viewModel.activate();
                prevViewModelSet = [viewModel]
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

            var that = this;
            if (x - this.mouseDownX !== 0 && y - this.mouseDownY !== 0)
            {
                var boundingBox = {
                    left: Math.min(that.mouseDownX, x),
                    top: Math.min(that.mouseDownY, y),
                    right: Math.max(that.mouseDownX, x),
                    bottom: Math.max(that.mouseDownY, y)
                };

                // Empty the previous selection
                var collection = this.model.get("selection");
                collection.reset();

                RadioChannels.edit.trigger(
                    GlyphEvents.dragSelect,
                    boundingBox,
                    collection
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

    getAllGlypItemViews: function()
    {
        var collection = [];
        this.children.each(function(view)
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
        $(document).mousemove(function(event)
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
    },

    onDestroy: function ()
    {
        this.seelectionBox.remove();
    }
});
