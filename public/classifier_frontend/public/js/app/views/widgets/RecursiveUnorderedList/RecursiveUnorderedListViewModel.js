import Backbone from "backbone";


var RecursiveUnorderedListViewModel = Backbone.Model.extend({
    defaults: {
        value: undefined,
        children: []
    },

    getOrAppendChild: function(value)
    {
        var matchingChild = this.get("children")
            .find(
                function(child)
                {
                    return child.get("value") === value;
                }
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