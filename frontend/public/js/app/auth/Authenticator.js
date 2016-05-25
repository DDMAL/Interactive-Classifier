import $ from "jquery";

export default class Authenticator {
    constructor()
    {
        // This will be the URL that we hit to authenticate.
        this._authUrl = Authenticator.getAuthUrl();
        // Authenticate every few seconds
        this._time = 5000;
    }

    /**
     * Start authenticating on an interval.
     */
    startTimedAuthentication()
    {
        var that = this;
        this._timer = setInterval(function ()
        {
            console.log("TIMER!");
            that.authenticate();
        }, this._time);
    }

    /**
     * Authenticate with the server then save the working POST url for when
     * we will submit to the server later.
     */
    authenticate()
    {
        var that = this;
        $.ajax({
            url: this._authUrl,
            type: 'POST',
            headers: {
                Accept: "application/json; charset=utf-8",
                "Content-Type": "application/json; charset=utf-8"
            },
            complete: function (response)
            {
                var responseData = JSON.parse(response.responseText);
                // Save the working url
                that._postUrl = responseData["working_url"];
            }
        });
    }

    /**
     * Get the working POST url for the Interactive Job.  This is the URL that
     * we make a post request to when we want to complete the interactive
     * portion of the interactive job.
     *
     * @returns {string}
     */
    getPostUrl()
    {
        return this._postUrl;
    }

    /**
     * Get the authentication url.
     *
     * @returns {string}
     */
    static getAuthUrl()
    {
        return window.location.href.split("/").slice(0, -2).join("/") + "/acquire/";
    }
}