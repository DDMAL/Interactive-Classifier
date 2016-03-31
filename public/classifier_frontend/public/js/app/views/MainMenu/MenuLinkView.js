import Marionette from "marionette";
// import App from "App";
import SubMenuView from "views/MainMenu/SubMenu/SubMenuView";
import template from "./main-menu-link.template.html";

export default Marionette.LayoutView.extend({
    template,

    tagName: 'li class="dropdown"',

    events: {
        "click .menu-link": "goToUrl"
    },

    regions: {
        dropDownRegion: ".dropdown-menu"
    },

    goToUrl: function(event)
    {
        event.preventDefault();
        console.log("click menu link");
        // App.appRouter.routeToPage(event.target.href);
    },

    onShow: function()
    {
        if (this.model.get("subLinks"))
        {
            this.dropDownRegion.show(new SubMenuView({
                collection: this.model.get("subLinks")
            }));
        }
    }
});
