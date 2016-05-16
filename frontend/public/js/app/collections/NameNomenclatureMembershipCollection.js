import Backbone from "backbone";
import NameNomenclatureMembership from "models/NameNomenclatureMembership";

export default Backbone.Collection.extend({
    model: NameNomenclatureMembership,

    initialize: function (options)
    {
        this.url = String(options.url);
    }
});