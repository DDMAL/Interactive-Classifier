import Marionette from "marionette";
import App from "App";


export default Marionette.AppRouter.extend({
    /* standard routes can be mixed with appRoutes/Controllers above */
    routes:
    {
        "": "home",
        "page/:id/": "editPage",
        "classifier/:id/": "editClassifier"
    },

    home: function()
    {
        App.home();
    },

    editPage: function(id)
    {
        App.editPage(id);
    },

    editClassifier: function (id) {
        App.editClassifier(id);
    }
});