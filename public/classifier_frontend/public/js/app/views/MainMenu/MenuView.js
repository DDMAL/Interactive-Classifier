import Backbone from "backbone";
import Marionette from "marionette";
import GlobalVars from "config/GlobalVars";
import MenuLinkView from "views/MainMenu/MenuLinkView";
import MenuLinkViewModel from "views/MainMenu/MenuLinkViewModel";

import template from "./main-menu.template.html"

export default Marionette.CompositeView.extend({
    template,

    childView: MenuLinkView,
    childViewContainer: ".navbar-left",

    initialize: function ()
    {
        var menuLinks = new Backbone.Collection();
        menuLinks.add(new MenuLinkViewModel().set({
            url: GlobalVars.SITE_URL + "", text: "Neumes"
        }));
        menuLinks.add(new MenuLinkViewModel().set({
            url: GlobalVars.SITE_URL + "nomenclatures/", text: "Nomenclatures"
        }));
        //menuLinks.add(new Link().set({url:SITE_URL + "styles/", text: "Styles"}));

        this.collection = menuLinks;
    }
});