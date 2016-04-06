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
            text: "File",
            // clickEvent: "click:file",
            subLinks: new Backbone.Collection([
                new MenuLinkViewModel({
                    text: "Open",
                    clickEvent: MainMenuEvents.clickFileOpen
                }),
                new MenuLinkViewModel({
                    text: "Import GameraXML",
                    clickEvent: MainMenuEvents.clickFileImport
                }),
                new MenuLinkViewModel({
                    text: "Import MEI",
                    clickEvent: MainMenuEvents.clickFileImport
                }),
                new MenuLinkViewModel({
                    text: "Import Image",
                    clickEvent: MainMenuEvents.clickFileImport
                })
            ])
        }));
        menuLinks.add(new MenuLinkViewModel({
            url: "#",
            text: "Classifier",
            subLinks: new Backbone.Collection([
                new MenuLinkViewModel({
                    text: "Guess All",
                    clickEvent: MainMenuEvents.clickClassifierGuessAll
                }),
                new MenuLinkViewModel({
                    text: "Reset All",
                    clickEvent: MainMenuEvents.clickClassifierResetAll
                })
            ])
        }));

        this.collection = menuLinks;
    }
});