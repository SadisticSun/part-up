var d = Debug('services:emails');

var locales = ['en', 'nl'];
var templates = [
    'dailydigest',
    'invite_upper_to_network',
    'invite_upper_to_partup_activity',
    'upper_mentioned_in_partup',
    'partup_created_in_network',
    'partups_networks_new_pending_upper',
    'partups_networks_accepted',
    'custom'
];
var templateName;
var templateFile;

/**
 * Pre-compile all template combinations so it only happens once
 */
templates.forEach(function(type) {
    locales.forEach(function(locale) {
        SSR.compileTemplate('email-' + type + '-' + locale, [
            Assets.getText('private/emails/header.' + locale + '.html'),
            Assets.getText('private/emails/' + type + '.' + locale + '.html'),
            Assets.getText('private/emails/footer.' + locale + '.html')
        ].join(''));
    });
});

/**
 @namespace Partup server email service
 @name Partup.server.services.emails
 @memberof Partup.server.services
 */
Partup.server.services.emails = {
    /**
     * Send an email
     *
     * @param {Object} options
     * @param {String} options.type
     * @param {Object} options.typeData
     * @param {String} options.toAddress
     * @param {String} options.fromAddress
     * @param {String} options.subject
     * @param {String} options.locale
     * @param {Object} options.userEmailPreferences
     * @param {String|null} options.body
     */
    send: function(options) {
        var options = options || {};
        var emailSettings = {};

        if (!options.type) throw new Meteor.Error('Required argument [options.type] is missing for method [Partup.server.services.emails::send]');
        if (!options.typeData) throw new Meteor.Error('Required argument [options.typeData] is missing for method [Partup.server.services.emails::send]');
        if (!options.toAddress) throw new Meteor.Error('Required argument [options.toAddress] is missing for method [Partup.server.services.emails::send]');
        if (!options.fromAddress) options.fromAddress = Partup.constants.EMAIL_FROM;
        if (!options.subject) throw new Meteor.Error('Required argument [options.subject] is missing for method [Partup.server.services.emails::send]');
        if (!options.locale) throw new Meteor.Error('Required argument [options.locale] is missing for method [Partup.server.services.emails::send]');

        // Check if user has disabled this email type
        if (options.userEmailPreferences && !options.userEmailPreferences[options.type]) {
            // This mail is disabled, so end here
            return;
        }

        options.typeData.baseUrl = Meteor.absoluteUrl();

        emailSettings.from = options.fromAddress;
        emailSettings.to = options.toAddress;
        emailSettings.subject = options.subject;

        if (options.body) {
            options.type = 'custom';

            // Replace all newlines with <br>
            var body = options.body.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2');

            // Replace all tags with their value, so users can use {name} for example in their email body
            Object.keys(options.typeData).forEach(function(key) {
                body = body.replace(new RegExp('{\s*' + key + '\s*}'), options.typeData[key]);
            });

            options.typeData.body = body;
        }

        emailSettings.html = SSR.render('email-' + options.type + '-' + options.locale, options.typeData);

        Email.send(emailSettings);
    },

    /**
     * Validate if the required tags are present in the body
     *
     * @param {String} body
     * @param {[String]} requiredTags
     */
    validateRequiredBodyTags: function(body, requiredTags) {
        var valid = true;

        requiredTags.forEach(function(tag) {
            var matches = body.match(new RegExp('{\\s*' + tag + '\\s*}'));

            if (!matches) valid = false;
        });

        return valid;
    }
};
