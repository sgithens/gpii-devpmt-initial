"use strict";

var gpii = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.devpmt");

/**
 * contextNames - Takes a rawPrefs set and returns a list of all the
 * context names. This function ensures that the first item in the list is
 * always the default context, 'gpii-default', and the rest of the contexts
 * in an order that will always be the same. The stability of the order is
 * so that we can build html tables and other structures successfully.
 *
 * @param prefs (Object) - A prefs set.
 * @return (Array) - List of context names.
 */
gpii.devpmt.contextNames = function (prefs) {
    var contextNames = [];
    fluid.each(prefs.contexts, function (value, key) {
        if (key !== "gpii-default" && contextNames.indexOf(key) < 0) {
            contextNames.push(key);
        }
    });
    contextNames.sort();
    contextNames.unshift("gpii-default");
    return contextNames;
};


/**
 * npsetApplications - Goes through all the contexts in a flat prefs set
 * and pulls out the flat pref URI and app ID. Returns all the apps a
 * user has settings.
 *
 * @param prefs (Object) Transformed flat preferences set
 * @return (Array) An array of objects structured as the following: (RWG example)
 *     {
 *         uri: "http://registry.gpii.net/applications/com.texthelp.readWriteGold",
 *         appId: "com.texthelp.readWriteGold"
 *     }
 */
gpii.devpmt.npsetApplications = function (prefs) {
    var apps = {};
    fluid.each(prefs.contexts, function (context) {
        fluid.each(context.preferences, function (prefBody, prefKey) {
            if (prefKey.startsWith("http://registry.gpii.net/applications")) {
                if (!apps[prefKey]) {
                    apps[prefKey] = {
                        uri: prefKey,
                        appId: prefKey.split(/\//).pop(),
                        settingKeys: []
                    };
                }
                // Add any keys that may or may not be in one of the contexts
                fluid.each(prefBody, function (settingBody, settingKey) {
                    if (apps[prefKey].settingKeys.indexOf(settingKey) < 0) {
                        apps[prefKey].settingKeys.push(settingKey);
                    }
                });
            }
        });
    });
    return fluid.values(apps);
};

/**
 * Query a lunr index in our case insensitive, match anything style that
 * is used for the various list/API filter boxes that are typically rendered
 * at the top of a list or table. This routine is meant to encapsulate
 * any of the oddities of lunr search strings, and necessary usage of
 * various wildcards for list filtering use cases.
 *
 * @param {Object} lunrIndex The existing lunr index to query.
 * @param {String} filterString The string used to filter the results.
 * @return {Array} The matching lunr results.
 */
gpii.devpmt.lunrListFilterSearch = function (lunrIndex, filterString) {
    // TODO escape entire string so search keywords like 'not' can be used
    return lunrIndex.query(function (q) {
        // The lunr querystring documentation isn't great, but apparently
        // lowercasing the terms does a case insensitive search.
        var lowerFilterString = filterString.toLowerCase();
        q.term(lowerFilterString);
        q.term("*" + lowerFilterString);
        q.term("*" + lowerFilterString + "*");
    });
};
