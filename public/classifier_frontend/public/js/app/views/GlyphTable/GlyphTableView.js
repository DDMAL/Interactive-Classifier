// import Backbone from "backbone";
import Marionette from "marionette";
import _ from "underscore";
// import $ from "jquery";
import Radio from "backbone.radio";
import GlyphTableRowView from "views/GlyphTable/Row/GlyphTableRowView";
import GlyphEvents from "events/GlyphEvents";
import RadioChannels from "../../radio/RadioChannels";


export default Marionette.CollectionView.extend({
    tagName: 'table class="table table-hover"',
    childView: GlyphTableRowView,

    isMouseDown: false,
    mouseDownX: undefined,
    mouseDownY: undefined,

    ui: {
        "selectionBox": ".selection-box"
    },

    events: {
        "keypress .table": "test",
        "mousedown": "onMouseDown",
        "mouseup": "onMouseUp"
    },

    test: function (e)
    {
        console.log(e);
    },

    onMouseDown: function (event)
    {
        event.preventDefault();
        this.isMouseDown = true;
        this.mouseDownX = event.clientX;
        this.mouseDownY = event.clientY;
    },

    onMouseUp: function (event)
    {
        // console.log(event);
        this.isMouseDown = false;
        var x = event.clientX,
            y = event.clientY;

        var that = this;
        if (x - this.mouseDownX !== 0 && y - this.mouseDownY !== 0) {
            var boundingBox = {
                left: Math.min(that.mouseDownX, x),
                top: Math.min(that.mouseDownY, y),
                right: Math.max(that.mouseDownX, x),
                bottom: Math.max(that.mouseDownY, y)
            };

            // Empty the previous selection
            var collection = this.model.get("selection");
            collection.reset();
            RadioChannels.edit.trigger(GlyphEvents.dragSelect, boundingBox, collection);
        }
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

        this.listenTo(Radio.channel("edit"), GlyphEvents.openGlyphEdit,
            function(model, viewModel)
            {
                clearPrevViewModels();
                // Activate the view so that it turns blue
                viewModel.activate();
                prevViewModelSet = [viewModel]
            });
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
    }
});
