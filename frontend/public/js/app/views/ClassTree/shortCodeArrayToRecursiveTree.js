export default function (shortCodes, root)
{
    // Split up the shortcodes by periods
    var splitShortCodes = shortCodes.map(
        function (shortCode)
        {
            return shortCode.split('.');
        }
    );

    console.log("split:", splitShortCodes);

    // Iterate through the split shortcodes, recursively adding to the root
    for (var i = 0; i < splitShortCodes.length; i++)
    {
        var codeArray = splitShortCodes[i];
        var node = root;
        for (var j = 0; j < codeArray.length; j++)
        {
            node = node.getOrAppendChild(codeArray[j]);
        }
    }
}
