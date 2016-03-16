import Marionette from 'marionette';
import RootView from 'views/Root/RootView';
import MenuView from "views/MainMenu/MenuView";

var App = new Marionette.Application({
    behaviors: {
    },

    onBeforeStart: function ()
    {
        // Instantiate the root view
        this.rootView = new RootView();
        //this.rootView.render();
        this.rootView.navigation.show(new MenuView());
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
