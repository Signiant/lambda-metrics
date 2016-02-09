module.exports = function(grunt){
  grunt.initConfig({
    compress: {
      main: {
        options: {
          archive: '../dist/lambda.zip',
        },
        files: [
          {
            src: '**/*',
            cwd: '../src',
            expand: true
          }
        ]
      }
    },
    copy: {
     main: {
       files: [
         {expand: true, cwd: '../deploy', src: ['**/*'], dest: '../dist/deploy/' },

       ]
     }
   }
  });


  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['compress', 'copy']);
}
