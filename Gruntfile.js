module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        mongoimport: {
            options: {
                db: 'yobusco',
                host: 'localhost',
                //port: '27017',
                //username: 'username',
                //password: 'password',
                stopOnError: false,
                collections: [
                  {
                      name: 'servicecategories',
                      file: 'database/servicecategories.json',
                      drop: true
                  },
                  {
                      name: 'servicesubcategories',
                      file: 'database/servicesubcategories.json',
                      drop: true
                  },
                  {
                      name: 'servicesuppliers',
                      file: 'database/servicesuppliers.json',
                      drop: true
                  },
                  {
                      name: 'users',
                      file: 'database/users.json',
                      drop: true
                  }
                ]
            }
        }
    });

    // loadNpmTasks
    grunt.loadNpmTasks('grunt-mongoimport');
};