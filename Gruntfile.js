module.exports = function(grunt) {

  var FILE_PATH = 'detour/static/js/';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [FILE_PATH + 'require.js', FILE_PATH + 'build/optimized.js'],
        dest: FILE_PATH + 'build/<%= pkg.name %>.js'
      }
    },
    requirejs: {
      compile: {
        options: {
          baseUrl: "detour/static/js",
          mainConfigFile: "detour/static/js/config.js",
          out: "detour/static/js/build/optimized.js",
          name: "config"
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.registerTask('default', ['requirejs', 'concat']);

};
