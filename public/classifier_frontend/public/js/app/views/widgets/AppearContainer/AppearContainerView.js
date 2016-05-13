import Marionette from "marionette";
import $ from "jquery";
import template from "./appear-container.template.html";

export default Marionette.LayoutView.extend({
    template,

    ui: {
        appearFlag: ".appear-flag"
    },

    regions: {
        appearingRegion: ".appearing-item"
    },

    // events: {
    //     // "@ui.appearFlag appear": "onAppear"
    //     "document.scroll": "onAppear"
    // },

    onShow: function ()
    {
        var that = this;
        $(window).on("scroll", function ()
        {
            that.onAppear();
        })
    },

    /**
     * Function to call when the view appears
     */
    onAppear: function ()
    {
        // We only want it the first time!
        if (this.model.hasAppeared() === false)
        {
            if (this.isFlagOnScreen())
            {
                console.log("View appeared!");
                // Record that the appearance has happened
                this.model.appear();
                // Display the hidden view
                if (this.model.get("innerView"))
                {
                    this.appearingRegion.show(this.model.get("innerView"));
                }
                // Delete the listener
                // $(window).off("scroll",
                //     function ()
                //     {
                //         that.onAppear();
                //     });
            }
        }
    },

    onDestroy: function ()
    {
        var that = this;
        $(window).off("scroll",
            function ()
            {
                that.onAppear();
            });
    },

    /**
     * Returns true if the flag is on screen.
     *
     * @returns {boolean}
     */
    isFlagOnScreen: function ()
    {
        var yOffset = this.ui.appearFlag.offset().top;
        return (yOffset >= window.pageYOffset && yOffset <= window.pageYOffset + window.innerHeight);
    }
});