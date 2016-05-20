console.log("Starting worker!");

var authenticationEndpoint = undefined;

/**
 * Authenticate the application with the server.
 */
authenticate = function (endpoint)
{
    console.log(endpoint);

    var request = new XMLHttpRequest();
    request.open("POST", authenticationEndpoint, false);
    request.setRequestHeader("Content-type", "application/json");
    request.setRequestHeader("Accept", "application/json");
    request.send();
};

/**
 * Set the authentication endpoint that we will post to.
 *
 * @param e
 */
onmessage = function (e)
{
    // Set the endpoint
    authenticationEndpoint = String(e.data[0]);
    // Do the first authentication
    authenticate(authenticationEndpoint);
};

/**
 * Authenticate every 5 seconds!
 */
setInterval(function ()
{
    if (authenticationEndpoint)
    {
        authenticate(authenticationEndpoint);
    }
}, 5000);
