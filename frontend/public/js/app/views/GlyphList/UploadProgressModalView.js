import Marionette from "marionette";
import template from "./modal-upload-progress.template.html";

export default Marionette.ItemView.extend({
    template,

    title: undefined,
    text: undefined,
    percent: 0,

    ui: {
        "modal": ".modal",
        "percentBar": ".progress-bar"
    },

    initialize: function (options)
    {
        this.title = options.title;
        this.text = options.text;
    },

    /**
     * Set the percent value of the progress bar.
     *
     * @param newPercent
     */
    setPercent: function (newPercent)
    {
        this.percent = parseInt(newPercent, 10);
        this.ui.percentBar.html(this.percent + "\%");
    },

    serializeData: function ()
    {
        return {
            title: this.title,
            text: this.text
        };
    },

    open: function ()
    {
        console.log(this);
        console.log(this.ui);
        this.ui.modal.modal(
            {
                backdrop: 'static',
                keyboard: false
            }
        );
    },

    close: function ()
    {
        this.ui.modal.modal('hide');
    }
});