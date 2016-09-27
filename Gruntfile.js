module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    compress: {
      dist: {
        options: {
          archive: "dist.zip",
          mode: "zip"
        },
        files: [{
          expand: true,
          src: [
              'manifest.json',
              'LICENSE',
              'README.md',
              'browser_action/*',
              'content_scripts/*',
              'options/*',
              'lib/*',
              'img/**'
            ]
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask('zip', ['compress:dist']);
  grunt.registerTask('default', ['zip']);
};