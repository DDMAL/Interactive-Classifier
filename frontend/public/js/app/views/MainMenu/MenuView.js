import Backbone from "backbone";
import Marionette from "marionette";
import MenuLinkView from "views/MainMenu/MenuLinkView";
import MenuLinkViewModel from "views/MainMenu/MenuLinkViewModel";
import MenuViewModel from "views/MainMenu/MenuViewModel";
import MainMenuEvents from "events/MainMenuEvents";
import Strings from "localization/Strings";
import template from "./main-menu.template.html";

/**
 * The main menu which renders at the top of the window.
 */
export default Marionette.CompositeView.extend({
    template,
    childView: MenuLinkView,
    childViewContainer: ".navbar-left",

    initialize: function ()
    {
        // A model to handle the main properties of the menu
        this.model = new MenuViewModel({
            title: Strings.siteTitle
        });
        // A collection representing the menu links
        var menuLinks = new Backbone.Collection();

        menuLinks.add(new MenuLinkViewModel({
            url: "#",
            text: Strings.menuSubmitLabel,
            clickEvent: MainMenuEvents.clickSubmitCorrections
        }));
        menuLinks.add(new MenuLinkViewModel({
            url: "#",
            text: Strings.menuFinalizeLabel,
            clickEvent: MainMenuEvents.clickFinalizeCorrections
        }));
        /*menuLinks.add(new MenuLinkViewModel({
            url: "#",
            text: Strings.menuOpenImage,
            clickEvent: MainMenuEvents.clickTest
        }));*/

        menuLinks.add(new MenuLinkViewModel({
            url: "#",
            text: Strings.menuGroupLabel,
            clickEvent: MainMenuEvents.clickGroupClassify
        }));
        this.collection = menuLinks;
    }
});
