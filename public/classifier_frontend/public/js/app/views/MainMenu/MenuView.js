import Backbone from "backbone";
import Marionette from "marionette";
//import GlobalVars from "config/GlobalVars";
import MenuLinkView from "views/MainMenu/MenuLinkView";
import MenuLinkViewModel from "views/MainMenu/MenuLinkViewModel";
import MenuViewModel from "views/MainMenu/MenuViewModel";
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
            text: "File",
            subLinks: new Backbone.Collection([
                new MenuLinkViewModel({text: "Open"}),
                new MenuLinkViewModel({text: "Save"})
            ])
        }));
        menuLinks.add(new MenuLinkViewModel({
            url: "#",
            text: "Classifier",
            subLinks: new Backbone.Collection([
                new MenuLinkViewModel({text: "Guess All"})
            ])
        }));

        this.collection = menuLinks;
    }
});