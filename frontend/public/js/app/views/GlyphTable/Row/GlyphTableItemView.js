import Marionette from "marionette";
import GlyphEvents from "events/GlyphEvents";
import GlyphTableItemViewModel from "views/GlyphTable/Row/GlyphTableItemViewModel";
import RadioChannels from "radio/RadioChannels";
import template from "./table-glyph.template.html";
import Geometry from "utils/Geometry";

export default Marionette.ItemView.extend({
    template,
    viewModel: undefined,
    tableViewModel: undefined,

    tagName: 'div class="glyph-image-container"',

    events: {
        "click .glyph": "onClickGlyph"
    },

    modelEvents: {
        "change": "render"
    },

    initialize: function (options)
    {
        // Call the super constructor
        Marionette.ItemView.prototype.initialize.call(this, options);
        this.viewModel = new GlyphTableItemViewModel();
        this.tableViewModel = options.tableViewModel;

        // Re render when the viewmodel changes activity state
        this.listenTo(this.viewModel, "change:active", this.render);

        var that = this;
        this.listenTo(RadioChannels.edit, GlyphEvents.dragSelect,
            function (boundingBox, collection)
            {
                // If this div's bounding box is within the selection, then we've
                // gotta add the model to the multi selection collection.
                if (Geometry.rectangleOverlap(that.getPosition(), boundingBox))
                {
                    collection.add(that.model);
                    that.viewModel.activate();
                }
                else
                {
                    that.viewModel.deactivate();
                }
            }
        );
        this.listenTo(RadioChannels.edit, GlyphEvents.openGlyphEdit, function (model)
        {
            if (that.model !== model)
            {
                that.viewModel.deactivate();
            }
        });
    },

    onClickGlyph: function (event)
    {
        event.preventDefault();
        RadioChannels.edit.trigger(GlyphEvents.openGlyphEdit, this.model, this.viewModel);
    },

    serializeData: function ()
    {
        var data = this.model.toJSON();

        data.outerTag = "";
        if (this.viewModel.isActive())
        {
            data.outerTag = "bg-primary";
        }

        // Figure out which background color will be used
        data.cssTag = "";
        if (this.model.get("id_state_manual") === true)
        {
            data.cssTag = "bg-success";
        }
        else
        {
            data.cssTag = "bg-warning";
        }

        data.spriteSheetUrl = this.tableViewModel.get("spriteSheetUrl");
        return data;
    },

    activate: function ()
    {
        this.isActive = true;
        this.render();
    },

    deactivate: function ()
    {
        this.isActive = false;
        this.render();
    },

    /**
     * Get the positional information of the view in the dom.
     *
     * @returns {ClientRect}
     */
    getPosition: function ()
    {
        return this.el.getBoundingClientRect();
    }
});