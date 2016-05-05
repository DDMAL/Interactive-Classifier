import Backbone from "backbone";
import Marionette from "marionette";
import MenuLinkView from "views/MainMenu/MenuLinkView";
import MenuLinkViewModel from "views/MainMenu/MenuLinkViewModel";
import MenuViewModel from "views/MainMenu/MenuViewModel";
import MainMenuEvents from "events/MainMenuEvents";

import template from "./main-menu.template.html"

export default Marionette.CompositeView.extend({
    template,
    childView: MenuLinkView,
    childViewContainer: ".navbar-left",

    initialize: function ()
    {
        // A model to handle the main properties of the menu
        this.model = new MenuViewModel({
            title: "Interactive Classifier"
        });
        // A collection representing the menu links
        var menuLinks = new Backbone.Collection();

        menuLinks.add(new MenuLinkViewModel({
            url: "#",
            text: "Submit Corrections and Re-Classify",
            clickEvent: MainMenuEvents.clickSubmitCorrections
        }));
        menuLinks.add(new MenuLinkViewModel({
            url: "#",
            text: "Finalize Classification and Save GameraXML",
            clickEvent: MainMenuEvents.clickFinalizeCorrections
        }));

        this.collection = menuLinks;
    }
});