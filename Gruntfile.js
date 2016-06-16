module.exports = function(grunt) {
  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-exec');

  // Configure tasks
  grunt.initConfig({
    // remove already-built files
    clean: {
      js: ['public/weco.js', 'public/weco.min.js']
    },
    // javascript linting
    jshint: {
      files: ['Gruntfile.js', 'server.js', 'public/**/*.js'],
      options: {
        node: true, // tell jshint we are using nodejs to avoid incorrect errors
        globals: {  // list of global variables and whether they are assignable
          "angular": false
        }
      }
    },
    // file concatenation
    concat: {
      dist: {
        src: ['public/**/*.js'],
        dest: 'public/weco.js',
      }
    },
    // file minification
    uglify: {
      dist: {
        files: {
          'public/weco.min.js': ['public/weco.js']
        }
      }
    },
    // Compile Less to CSS
    less: {
      dist: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2,
          strictMath: true,
          strictUnits: true
        },
        files: {
          // destination file and source file
          "public/assets/styles/css/app.css": "public/assets/styles/less/app.less"
        }
      }
    },
    // File watching
    watch: {
      styles: {
        files: ['public/assets/styles/less/**/*.less'],
        tasks: ['less'],
        options: {
          spawn: false
        }
      },
      js: {
        files: ['public/**/*.js'],
        tasks: ['js'],
        options: {
          spawn: false
        }
      }
    },
    // Live reload server (for local development)
    nodemon: {
      dev: {
        script: 'server.js'
      }
    },
    // concurrently run the server and watch for file changes
    concurrent: {
      serve: {
        options: {
          logConcurrentOutput: true
        },
        tasks: ['nodemon', 'watch']
      }
    },
    // execute shell commands
    exec: {
      publish: 'git checkout production && git merge master'
    }
  });

  grunt.registerTask('js', ['clean', 'jshint', 'concat', 'uglify']);
  grunt.registerTask('serve', 'concurrent:serve');
  grunt.registerTask('build', ['clean', 'jshint', 'concat', 'uglify', 'less']);
  grunt.registerTask('publish', 'exec:publish');
};
