import Marionette from "marionette";
import GlobalVars from "config/GlobalVars";
import NameNomenclatureMembership from "models/NameNomenclatureMembership";
import template from "./create-name-nomenclature-membership.template.html";

export default Marionette.ItemView.extend({
    template,

    tagName: "div",

    /**
     * Collection of names
     */
    names: undefined,
    /**
     * Collection of nomenclatures
     */
    nomenclatures: undefined,
    /**
     * Collection of nameNomenclatureMemberships for when it's done.
     */
    nameNomenclatureMemberships: undefined,

    ui: {
        'nameField': "select[name='name']",
        'nomenclatureField': "select[name='nomenclature']",
        'statusDiv': ".status-message"
    },

    events: {
        'submit': 'onSubmit'
    },

    initialize: function(options)
    {
        this.names = options.names;
        this.nomenclatures = options.nomenclatures;
        this.nameNomenclatureMemberships = options.nameNomenclatureMemberships;

        // Re-render if name and nomenclature list changes
        this.listenTo(this.names, 'all', this.test);
        this.listenTo(this.nomenclatures, 'all', this.test);
    },

    test: function() {
        console.log("IT HAPPENED.");
        this.render();
    },

    /**
     * Serialize a list of names and nomenclatures.
     *
     * @returns {{names: string[], nomenclatures: string[]}}
     */
    serializeData: function()
    {
        return {
            names: this.names.toJSON(),
            nomenclatures: this.nomenclatures.toJSON()
        };
    },


    onSubmit: function(event)
    {
        event.preventDefault();
        console.log("submit");
        // Create the membership object
        var membership = new NameNomenclatureMembership(
            {
                url: GlobalVars.SITE_URL + "name-nomenclature-memberships/",
                name: this.ui.nameField.val(),
                nomenclature: this.ui.nomenclatureField.val()
            }
        );
        console.log("membership:", membership.toJSON());
        // Save it to the server
        var that = this;
        membership.save(null,
            {
                success: function()
                {
                    // Manually copy the url
                    membership.url = membership.get("url");
                    // Add the membership to the created ones
                    that.nameNomenclatureMemberships.add(membership);
                    // Reset the option fields to default
                    that.ui.nameField.val("null");
                    that.ui.nomenclatureField.val("null");
                    // Display the user status message
                    that.ui.statusDiv.html('<p class="alert alert-success" role="alert">Name - Nomenclature membership saved successfully.</p>');
                    that.ui.statusDiv.find("p").fadeOut(2500);
                },
                error: function(model, event)
                {
                    console.log("event:", model, event);
                    that.ui.statusDiv.html('<p class="alert alert-warning" role="alert">Error: Name -' + event.responseText + '</p>');
                    that.ui.statusDiv.find("p").fadeOut(2500);
                }
            }
        );
    }
});