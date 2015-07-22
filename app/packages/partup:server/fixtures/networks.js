Meteor.startup(function() {
    if (process.env.NODE_ENV.match(/development|staging/)) {
        if (!Networks.find().count()) {

            /* 1 */
            Networks.insert({
                '_id' : 'nqBnE8nSLasaapXXS',
                'name' : 'ING (public)',
                'privacy_type' : 1,
                'slug' : 'ing-public',
                'uppers' : [ 
                    'q63Kii9wwJX3Q6rHS'
                ],
                'admin_id' : 'q63Kii9wwJX3Q6rHS',
                'created_at' : new Date('2015-07-21T15:47:33.225Z'),
                'updated_at' : new Date('2015-07-21T15:47:33.225Z')
            });

            /* 2 */
            Networks.insert({
                '_id' : 'kRCjWDBkKru3KfsjW',
                'name' : 'ING (invite)',
                'privacy_type' : 2,
                'slug' : 'ing-invite',
                'uppers' : [ 
                    'q63Kii9wwJX3Q6rHS', 
                    'K5c5M4Pbdg3B82wQH'
                ],
                'admin_id' : 'q63Kii9wwJX3Q6rHS',
                'created_at' : new Date('2015-07-21T15:51:48.825Z'),
                'updated_at' : new Date('2015-07-21T15:51:48.825Z'),
                'invites' : [ 
                    {
                        '_id' : 'a7qcp5RHnh5rfaeW9',
                        'invited_at' : new Date('2015-07-22T09:11:08.062Z'),
                        'invited_by_id' : 'K5c5M4Pbdg3B82wQH'
                    }
                ]
            });

            /* 3 */
            Networks.insert({
                '_id' : 'wfCv4ZdPe5WNT4xfg',
                'name' : 'ING (closed)',
                'privacy_type' : 3,
                'slug' : 'ing-closed',
                'uppers' : [ 
                    'q63Kii9wwJX3Q6rHS', 
                    null, 
                    null, 
                    null, 
                    'K5c5M4Pbdg3B82wQI'
                ],
                'admin_id' : 'q63Kii9wwJX3Q6rHS',
                'created_at' : new Date('2015-07-21T15:51:56.562Z'),
                'updated_at' : new Date('2015-07-21T15:51:56.562Z'),
                'invites' : [ 
                    {
                        '_id' : 'K5c5M4Pbdg3B82wQI',
                        'invited_at' : new Date('2015-07-22T09:12:46.307Z'),
                        'invited_by_id' : 'q63Kii9wwJX3Q6rHS'
                    }, 
                    {
                        '_id' : 'a7qcp5RHnh5rfaeW9',
                        'invited_at' : new Date('2015-07-22T09:31:48.358Z'),
                        'invited_by_id' : 'q63Kii9wwJX3Q6rHS'
                    }
                ],
                'pending_uppers' : [ 
                    'a7qcp5RHnh5rfaeW9'
                ]
            });


            /* 4 */
            Networks.insert({
                '_id' : 'ibn27M3ePaXhmKzWq',
                'name' : 'Lifely (open)',
                'privacy_type' : 1,
                'slug' : 'lifely-open',
                'uppers' : [ 
                    'q63Kii9wwJX3Q6rHS', 
                    'K5c5M4Pbdg3B82wQH', 
                    'a7qcp5RHnh5rfaeW9'
                ],
                'admin_id' : 'q63Kii9wwJX3Q6rHS',
                'created_at' : new Date('2015-07-21T15:52:04.548Z'),
                'updated_at' : new Date('2015-07-21T15:52:04.548Z')
            });
        }
    }
});