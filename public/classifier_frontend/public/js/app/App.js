import Backbone from "backbone";
import Marionette from 'marionette';
import RootView from 'views/Root/RootView';
import MenuView from "views/MainMenu/MenuView";
import DashBoardView from "views/Dashboard/DashboardView";
import Page from "models/Page";
//import GlyphDashboardView from "views/GlyphList/GlyphDashboardView";
import getCookie from "utils/getCookie";

var App = new Marionette.Application({
    behaviors: {
    },

    onBeforeStart: function ()
    {
        // Get the CRSF token
        this.csrftoken = getCookie('csrftoken');
        var oldSync = Backbone.sync;
        Backbone.sync = function(method, model, options)
        {
            options.beforeSend = function(xhr)
            {
                xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
            };
            return oldSync(method, model, options);
        };
        // Instantiate the root view
        this.rootView = new RootView();
        //this.rootView.render();
        this.rootView.navigation.show(new MenuView());
    },

    showNavigation: function(view)
    {
        console.log(this.rootView);
        this.rootView.navigation.show(view);
    },

    editPage: function(id)
    {
        var page = new Page();
        page.url = "/page/" + parseInt(id) + "/";
        console.log(page);
        var that = this;
        page.fetch({"success": function()
        {
            console.log("success");
            that.rootView.container.show(new DashBoardView({model: page}));
        }
        });
    }
});

App.on('initialize:before', function()
{
    // options.anotherThing = true; // Add more data to your options
});
App.on('initialize:after', function()
{
});

console.log(App);

export default App;
