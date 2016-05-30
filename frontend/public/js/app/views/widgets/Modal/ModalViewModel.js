import Backbone from "backbone";

/**
 * This ViewModel controls the state of a modal.
 *
 * The innerView property points to an arbitrary view that is rendered
 * in the body of the modal.
 *
 * The isClosable property determines whether or not the user has the power to manually close the view.
 */
export default Backbone.Model.extend({

    defaults: {
        title: "",
        innerView: undefined,
        isCloseable: false
    },

    open: function ()
    {
        this.trigger("open");
    },

    close: function ()
    {
        this.trigger("close");
    }
});