import Marionette from "marionette";
import App from "App";


export default Marionette.AppRouter.extend({
    /* standard routes can be mixed with appRoutes/Controllers above */
    routes:
    {
        "page/:id/": "editPage"
    },

    editPage: function(id)
    {
        App.editPage(id);
    }

    //openGlyphList: function()
    //{
    //    // Start the glyph list module
    //    App.module("GlyphList").start();
    //},
    //
    //openGlyphEditor: function(id)
    //{
    //    // Start the individual glyph editor
    //    App.module("GlyphEdit").start();
    //    App.module("GlyphEdit").initializeId(id);
    //},
    //
    //openNomenclatureList: function()
    //{
    //    // Start the nomenclature list module
    //    App.module("NomenclatureList").start();
    //},
    //
    //openNomenclatureEdit: function(id)
    //{
    //    App.module("NomenclatureEdit").start();
    //    App.module("NomenclatureEdit").initializeId(id);
    //},

    // routeToPage: function(url)
    // {
    //     var newPageUrl = GlobalVars.SITE_SUBFOLDER + String(url).replace(/.*\/neumeeditor\//g, "");
    //     this.navigate(
    //         // Strip site url if need be
    //         newPageUrl,
    //         {trigger: true}
    //     );
    // }
});