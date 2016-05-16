import Marionette from "marionette";

export default Marionette.extend({
    internalView: undefined,

    initialize: function (options)
    {
        this.internalView = options.internalView;
    }
});