import Marionette from "marionette";
import GlyphEvents from "events/GlyphEvents";
import GlyphTableItemViewModel from "views/GlyphTable/Row/GlyphTableItemViewModel";
import RadioChannels from "radio/RadioChannels";
import template from "./table-glyph.template.html";
import Geometry from "utils/Geometry";

/**
 * This view is a single Glyph item in the glyph table.  This is the childView
 * for the GlyphTableRowView collection view.
 *
 * This view triggers the events that occur when the user clicks on the glyph.
 *
 * This view also automatically checks if the glyph collides with the
 * selectionBox lasso.
 */
export default Marionette.ItemView.extend({
    template,
    viewModel: undefined,
    tableViewModel: undefined,

    tagName: 'div',
    className: "glyph-image-container",

    events: {
        "click .glyph": "onClickGlyph"
    },

    modelEvents: {
        "change": "render"
    },

    /**
     * 
     *
     * @param options
     */
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
            function (boundingBox, additional)
            {
                if (boundingBox)
                {
                    // If this div's bounding box is within the selection, then we've
                    // gotta add the model to the multi selection collection.
                    if (Geometry.rectangleOverlap(that.getPosition(), boundingBox))
                    {
                        // Add this glyph to the collection
                        RadioChannels.edit.trigger(GlyphEvents.selectGlyph, that.model);
                        that.viewModel.activate();
                    }
                    else if (!additional)
                    {
                        // If it's additional, then we don't deactivate!
                        that.viewModel.deactivate();
                    }
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

    /**
     * When the user clicks on a glyph, there are two possible behaviours
     * depending on whether or not the shift key is being held.
     *
     * If the user holds the shift key, then there are two possibilities.
     * If this glyph is already selected, then the glyph is unselected.
     * If the glyph isn't selected, then the glyph is added to the list of
     * currently selected glyphs in the GlyphMultiEditView.
     *
     * If the user is not holding the shift key, then all other glyphs are
     * unselected, the GlyphEditView is opened, and this glyph is selected.
     *
     * @param event jQuery event object.
     */
    onClickGlyph: function (event)
    {
        event.preventDefault();

        console.log(event);
        if (event.shiftKey)
        {
            // If the glyph is already active, then deactivate it.
            // If the glyph is not already active, then activate it.
            if (this.viewModel.isActive())
            {
                this.viewModel.deactivate();
                RadioChannels.edit.trigger(GlyphEvents.deselectGlyph, this.model);
            }
            else
            {
                this.viewModel.activate();
                RadioChannels.edit.trigger(GlyphEvents.selectGlyph, this.model);
            }
            RadioChannels.edit.trigger(GlyphEvents.dragSelect);
        }
        else
        {
            this.viewModel.activate();
            RadioChannels.edit.trigger(GlyphEvents.deselectAllGlyphs);
            RadioChannels.edit.trigger(GlyphEvents.selectGlyph, this.model);
            RadioChannels.edit.trigger(GlyphEvents.openGlyphEdit, this.model, this.viewModel);
        }
    },

    /**
     * Depending on whether the glyph has been manually identified by the user
     * or automatically identified by Gamera, we apply different CSS styles.
     *
     * @returns {*|string}
     */
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
        return data;
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