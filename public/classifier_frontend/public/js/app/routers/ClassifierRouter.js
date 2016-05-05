import Marionette from "marionette";
import App from "App";

export default Marionette.AppRouter.extend({
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

    editClassifier: function (id)
    {
        App.editClassifier(id);
    }
});