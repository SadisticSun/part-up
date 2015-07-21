Meteor.methods({
    /**
     * Insert a Partup
     *
     * @param {mixed[]} fields
     */
    'partups.insert': function(fields) {
        var user = Meteor.user();
        if (!user) throw new Meteor.Error(401, 'unauthorized');

        check(fields, Partup.schemas.forms.partupCreate);

        try {
            var newPartup = Partup.transformers.partup.fromFormStartPartup(fields);
            newPartup.uppers = [user._id];
            newPartup.creator_id = user._id;
            newPartup.created_at = new Date();

            //check(newPartup, Partup.schemas.entities.partup);

            newPartup._id = Partups.insert(newPartup);
            Meteor.users.update(user._id, {$push: {'partups': newPartup._id}});
            Meteor.users.update(user._id, {$push: {'upperOf': newPartup._id}});

            // Generate the slug for the Partup
            var slug = Partup.server.services.slugify.slugifyDocument(newPartup, 'name');
            Partups.update(newPartup._id, {$set: {'slug': slug}});

            return {
                _id: newPartup._id
            };
        } catch (error) {
            Log.error(error);
            throw new Meteor.Error(400, 'Partup could not be inserted.');
        }
    },

    /**
     * Update a Partup
     *
     * @param {string} partupId
     * @param {mixed[]} fields
     */
    'partups.update': function(partupId, fields) {
        var user = Meteor.user();
        var partup = Partups.findOneOrFail(partupId);

        check(fields, Partup.schemas.forms.partupUpdate);

        var uppers = partup.uppers || [];

        if (!partup.isEditableBy(user)) {
            throw new Meteor.Error(401, 'unauthorized');
        }

        try {
            var newPartupFields = Partup.transformers.partup.fromFormStartPartup(fields);

            Partups.update(partupId, {$set: newPartupFields});

            return {
                _id: partup._id
            };
        } catch (error) {
            Log.error(error);
            throw new Meteor.Error(400, 'Partup [' + partupId + '] could not be updated.');
        }
    },

    /**
     * Remove a Partup
     *
     * @param {string} partupId
     */
    'partups.remove': function(partupId) {
        var user = Meteor.user();
        var partup = Partups.findOneOrFail(partupId);

        if (!partup.isRemovableBy(user)) {
            throw new Meteor.Error(401, 'unauthorized');
        }

        try {
            var supporters = partup.supporters || [];
            var uppers = partup.uppers || [];
            Meteor.users.update({_id: {$in: supporters}}, {$pull: {'supporterOf': partupId}}, {multi: true});
            Meteor.users.update({_id: {$in: uppers}}, {$pull: {'upperOf': partupId}}, {multi: true});

            Images.remove(partup.image);
            Partups.remove(partupId);

            return {
                _id: partup._id
            };
        } catch (error) {
            Log.error(error);
            throw new Meteor.Error(400, 'Partup [' + partupId + '] could not be removed.');
        }
    },

    /**
     * Invite someone to a Partup
     *
     * @param  {String} partupId
     * @param  {String} email
     * @param  {String} name
     */
    'partups.invite': function(partupId, email, name) {
        var user = Meteor.user();
        var partup = Partups.findOneOrFail(partupId);

        if (!user) {
            throw new Meteor.Error(401, 'unauthorized');
        }

        var invites = partup.invites || [];
        var invitedEmails = mout.array.pluck(invites, 'email');

        if (invitedEmails.indexOf(email) > -1) {
            throw new Meteor.Error(403, 'Email is already invited to the given partup.');
        }

        // Compile the E-mail template and send the email
        SSR.compileTemplate('inviteUserEmail', Assets.getText('private/emails/InviteUser.html'));
        var url = Meteor.absoluteUrl() + 'partups/' + partup._id;

        Email.send({
            from: 'Part-up <noreply@part-up.com>',
            to: email,
            subject: 'Uitnodiging voor Part-up ' + partup.name,
            html: SSR.render('inviteUserEmail', {
                name: name,
                partupName: partup.name,
                partupDescription: partup.description,
                inviterName: user.name,
                url: url
            })
        });

        // Save the invite on the partup for further references
        var invite = {
            name: name,
            email: email
        };

        Partups.update(partupId, {$push: {'invites': invite}});

        Event.emit('partups.invited', user._id, partupId, email, name);

        return true;
    },

    /**
     * Get the amount of Part-ups based on provided filters
     *
     * @param {Object} options
     */
    'partups.discover_count': function(options) {
        this.unblock();

        var user = Meteor.user();

        var parameters = {
            networkId: options.networkId,
            locationId: options.locationId,
            sort: options.sort,
            query: options.query
        };

        return Partups.findForDiscover(user._id, {}, parameters).count();
    },

    /**
     * Discover partups based on provided filters
     *
     * @param {Object} options
     */
    'partups.discover': function(options) {
        var user = Meteor.user();

        var mongoOptions = {
            // limit: options.limit
        };

        var parameters = {
            networkId: options.networkId,
            locationId: options.locationId,
            sort: options.sort,
            query: options.query
        };

        return Partups.findForDiscover(user._id, mongoOptions, parameters).map(function(partup) {
            return partup._id;
        });
    },

    /**
     * Return a list of partups based on search query
     *
     * @param {string} searchString
     */
    'partups.autocomplete': function(searchString, exceptPartupId) {
        var user = Meteor.user();
        if (!user) throw new Meteor.Error(401, 'unauthorized');

        if (!searchString) throw new Meteor.Error(400, 'searchString parameter is required');

        try {
            return Partups.find({
                $and: [
                    {name: new RegExp('.*' + searchString + '.*', 'i')},
                    {_id: {$ne: exceptPartupId}}
                ]
            }).fetch();
        } catch (error) {
            Log.error(error);
            throw new Meteor.Error(400, 'Error while autocompleting partup string: ' + searchString);
        }
    }

});
