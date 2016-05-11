import Backbone from "backbone";
import _ from "underscore";

var RecursiveUnorderedListViewModel = Backbone.Model.extend({
    defaults: {
        value: undefined,
        children: []
    },

    getOrAppendChild: function(value)
    {
        var children = this.get("children");

        var matchingChild = _.find(
            children,
            (child) => child.get("value") === value
        );
        if (matchingChild)
        {
            return matchingChild;
        }
        else
        {
            // Append a child
            var newChild = new RecursiveUnorderedListViewModel({
                value: value,
                children: []
            });
            this.get("children").push(newChild);
            return newChild;
        }
    }
});

export default RecursiveUnorderedListViewModel;