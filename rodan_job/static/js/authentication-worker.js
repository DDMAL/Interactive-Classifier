console.log("Starting worker!");

var authenticationEndpoint = undefined;
var prevTime = undefined;

/**
 * Authenticate the application with the server.
 */
authenticate = function (endpoint)
{
    var request = new XMLHttpRequest();
    request.open("POST", endpoint, false);
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
 * Get the number of miliseconds since the last time tick() was called;
 *
 * @returns {number}
 */
tick = function ()
{
    var duration;
    if (prevTime)
    {
        duration = new Date().getTime() - prevTime;
    }
    else
    {
        duration = 0;
    }

    prevTime = new Date().getTime();
    return duration;
};

/**
 * Authenticate every 5 seconds!
 */
setInterval(function ()
{
    if (authenticationEndpoint)
    {
        authenticate(authenticationEndpoint);
        console.log(tick(), authenticationEndpoint);
    }
}, 5000);


