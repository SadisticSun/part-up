var path = Npm.require('path');
var Busboy = Npm.require('busboy');

var MAX_FILE_SIZE = 1000 * 1000 * 10; // 10 MB

Router.route('/csv/parse', {where: 'server'}).post(function() {
    var request = this.request;
    var response = this.response;

    // We are going to respond in JSON format
    response.setHeader('Content-Type', 'application/json');

    var busboy = new Busboy({'headers': request.headers});

    busboy.on('file', Meteor.bindEnvironment(function(fieldname, file, filename, encoding, mimetype) {
        var extension = path.extname(filename);

        if (!(/\.(csv)$/i).test(extension)) {
            response.statusCode = 400;
            // TODO: Improve error message (i18n)
            response.end(JSON.stringify({error: {reason: 'error-csvupload-invalidcsv'}}));
            return;
        }

        var baseFilename = path.basename(filename, extension);

        var size = 0;
        var buffers = [];

        file.on('data', Meteor.bindEnvironment(function(data) {
            size += data.length;
            buffers.push(new Buffer(data));
        }));

        file.on('end', Meteor.bindEnvironment(function() {
            if (size > MAX_FILE_SIZE) {
                response.statusCode = 400;
                // TODO: Improve error message (i18n)
                response.end(JSON.stringify({error: {reason: 'error-csvupload-toolarge'}}));
                return;
            }

            var body = Buffer.concat(buffers);

            CSV()
                .from.string(body, {
                        delimiter: ';', // Set the field delimiter. One character only, defaults to comma.
                        skip_empty_lines: true, // Don't generate empty values for empty lines.
                        trim: true // Ignore whitespace immediately around the delimiter.
                    })
                .to.array(Meteor.bindEnvironment(function(array) {
                    var list = lodash.chain(array)
                        .map(function(row) {
                            if (!Partup.services.validators.email.test(row[1])) return false;

                            return {
                                name: row[0],
                                email: row[1]
                            };
                        })
                        .compact()
                        .uniq(function(row) {
                            return row.email;
                        })
                        .value();

                    // Limit to 200 email addresses
                    if (list.length > 200) {
                        response.statusCode = 400;
                        // TODO: Improve error message (i18n)
                        response.end(JSON.stringify({error: {reason: 'error-csvupload-toolarge'}}));
                        return;
                    }

                    response.end(JSON.stringify({error: false, result: list}));
                }))
                .on('error', function(error) {
                    response.statusCode = 400;
                    // TODO: Improve error message (i18n)
                    response.end(JSON.stringify({error: {reason: 'error-csvupload-invalidcsv'}}));
                    return;
                });
        }));
    }));

    request.pipe(busboy);
});