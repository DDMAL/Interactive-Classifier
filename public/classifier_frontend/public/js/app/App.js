import Backbone from "backbone";
import Marionette from 'marionette';
import RootView from 'views/Root/RootView';
import MenuView from "views/MainMenu/MenuView";
import DashBoardView from "views/Dashboard/DashboardView";
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
        //this.rootView.container.show(new GlyphDashboardView());
        this.rootView.container.show(new DashBoardView());
    },

    showNavigation: function(view)
    {
        console.log(this.rootView);
        this.rootView.navigation.show(view);
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
