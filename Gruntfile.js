module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),

        // Copy files to distribution folder.
        //-----------------------------------
        copy : {
            all : {
                files : [{
                    // Copy all libraries that MetOClient UI depends on into distribution folder.
                    // Then, files and folders in distribution folder may be edited or overwritten
                    // without changing the original versions.
                    dest : 'dist/',
                    // Minified folder is not copied for flot here.
                    // Instead that content will be copied to the flot root in next step.
                    src : ['deps/**', '!deps/jquery.flot-0.8.2-alpha/minified/**']
                }, {
                    expand : true,
                    cwd : 'deps/jquery.flot-0.8.2-alpha/minified/',
                    dest : 'dist/deps/jquery.flot-0.8.2-alpha/',
                    src : ['**']
                }, {
                    // OpenLayers automatically loads some of the images from img folder.
                    // Therefore, overwrite default images by using corresponding MetOClient images
                    // if MetOClient has provided the images.
                    expand : true,
                    cwd : 'src/components/animator/',
                    dest : 'dist/deps/OpenLayers-2.13.1/',
                    src : ['img/**']
                }, {
                    // Copy component specific images that are used by component CSS.
                    expand : true,
                    cwd : 'src/',
                    dest : 'dist/',
                    // Copy source files to distribution folder. Some sources are skipped here
                    // because they are not needed in distribution, or they are handled in
                    // concatenation task or have been copied in other places in distribution
                    // hierarchy.
                    src : ['**', '!js/**', '!components/animator/img/**', '!components/animator/js/**', '!components/graph/js/**']
                }]
            }
        },

        // Concatenate files together.
        //----------------------------
        concat : {
            components : {
                files : {
                    // Animator
                    'dist/components/animator/js/animator.js' : ['src/components/animator/js/utils.js', 'src/components/animator/js/wmscapabilities.js', 'src/components/animator/js/wfscapabilities.js', 'src/components/animator/js/capabilities.js', 'src/components/animator/js/factory.js', 'src/components/animator/js/controller.js', 'src/components/animator/js/animator.js'],
                    'dist/components/animator/js/controllerconfig.js' : ['src/components/animator/js/controllerconfig.js'],
                    'dist/components/animator/js/config.js' : ['src/components/animator/js/config.js'],
                    'dist/components/animator/js/config-wmts.js' : ['src/components/animator/js/config-wmts.js'],
                    // Graph
                    'dist/components/graph/js/graph.js' : ['src/components/graph/js/timer.js', 'src/components/graph/js/controller.js', 'src/components/graph/js/graph.js'],
                    'dist/components/graph/js/config.js' : ['src/components/graph/js/config.js']
                }
            },
            intro : {
                files : {
                    // "Use strict" definition should be included once to the beginning of the concatenated file.
                    // Notice, combined files may contain their own strict definitions which should be removed in the grunt flow.
                    'dist/components/animator/js/animator.js' : ['src/js/intro.js', 'dist/components/animator/js/animator.js'],
                    'dist/components/graph/js/graph.js' : ['src/js/intro.js', 'dist/components/graph/js/graph.js']
                }
            }
        },

        // Minimize JavaScript for release.
        //---------------------------------
        uglify : {
            metoclient : {
                files : [{
                    dest : 'dist/components/animator/js/animator-min.js',
                    src : ['dist/components/animator/js/animator.js']
                }, {
                    dest : 'dist/components/graph/js/graph-min.js',
                    src : ['dist/components/graph/js/graph.js']
                }]
            },
            // Some of the thirdparty dependency libraries have not been originally minified.
            // They have been uglified for repository by using this task. Because thirdparty
            // dependency files are not modified in normal cases, there should not be much
            // need for this task. But, this task is provided just in case they are updated
            // to new version.
            deps : {
                files : [{
                    dest : 'deps/async/async-0.2.9-min.js',
                    src : 'deps/async/async-0.2.9.js'
                }, {
                    dest : 'deps/jquery.flot.axislabels/jquery.flot.axislabels-min.js',
                    src : ['deps/jquery.flot.axislabels/jquery.flot.axislabels.js']
                }, {
                    dest : 'deps/jquery-mousewheel/jquery.mousewheel-min.js',
                    src : ['deps/jquery-mousewheel/jquery.mousewheel.js']
                }, {
                    dest : 'deps/jquery.rule/jquery.rule-1.0.2-min.js',
                    src : ['deps/jquery.rule/jquery.rule-1.0.2.js']
                },
                // Flot content is minified into minified folder to clarify that those files
                // have not been part of the original lib. Then, possible comparison is easier.
                {
                    dest : 'deps/jquery.flot-0.8.2-alpha/minified/jquery.colorhelpers-min.js',
                    src : ['deps/jquery.flot-0.8.2-alpha/jquery.colorhelpers.js']
                }, {
                    dest : 'deps/jquery.flot-0.8.2-alpha/minified/jquery.flot.canvas-min.js',
                    src : ['deps/jquery.flot-0.8.2-alpha/jquery.flot.canvas.js']
                }, {
                    dest : 'deps/jquery.flot-0.8.2-alpha/minified/jquery.flot.categories-min.js',
                    src : ['deps/jquery.flot-0.8.2-alpha/jquery.flot.categories.js']
                }, {
                    dest : 'deps/jquery.flot-0.8.2-alpha/minified/jquery.flot.crosshair-min.js',
                    src : ['deps/jquery.flot-0.8.2-alpha/jquery.flot.crosshair.js']
                }, {
                    dest : 'deps/jquery.flot-0.8.2-alpha/minified/jquery.flot.errorbars-min.js',
                    src : ['deps/jquery.flot-0.8.2-alpha/jquery.flot.errorbars.js']
                }, {
                    dest : 'deps/jquery.flot-0.8.2-alpha/minified/jquery.flot.fillbetween-min.js',
                    src : ['deps/jquery.flot-0.8.2-alpha/jquery.flot.fillbetween.js']
                }, {
                    dest : 'deps/jquery.flot-0.8.2-alpha/minified/jquery.flot.image-min.js',
                    src : ['deps/jquery.flot-0.8.2-alpha/jquery.flot.image.js']
                }, {
                    dest : 'deps/jquery.flot-0.8.2-alpha/minified/jquery.flot-min.js',
                    src : ['deps/jquery.flot-0.8.2-alpha/jquery.flot.js']
                }, {
                    dest : 'deps/jquery.flot-0.8.2-alpha/minified/jquery.flot.navigate-min.js',
                    src : ['deps/jquery.flot-0.8.2-alpha/jquery.flot.navigate.js']
                }, {
                    dest : 'deps/jquery.flot-0.8.2-alpha/minified/jquery.flot.pie-min.js',
                    src : ['deps/jquery.flot-0.8.2-alpha/jquery.flot.pie.js']
                }, {
                    dest : 'deps/jquery.flot-0.8.2-alpha/minified/jquery.flot.resize-min.js',
                    src : ['deps/jquery.flot-0.8.2-alpha/jquery.flot.resize.js']
                }, {
                    dest : 'deps/jquery.flot-0.8.2-alpha/minified/jquery.flot.selection-min.js',
                    src : ['deps/jquery.flot-0.8.2-alpha/jquery.flot.selection.js']
                }, {
                    dest : 'deps/jquery.flot-0.8.2-alpha/minified/jquery.flot.stack-min.js',
                    src : ['deps/jquery.flot-0.8.2-alpha/jquery.flot.stack.js']
                }, {
                    dest : 'deps/jquery.flot-0.8.2-alpha/minified/jquery.flot.symbol-min.js',
                    src : ['deps/jquery.flot-0.8.2-alpha/jquery.flot.symbol.js']
                }, {
                    dest : 'deps/jquery.flot-0.8.2-alpha/minified/jquery.flot.threshold-min.js',
                    src : ['deps/jquery.flot-0.8.2-alpha/jquery.flot.threshold.js']
                }, {
                    dest : 'deps/jquery.flot-0.8.2-alpha/minified/jquery.flot.time-min.js',
                    src : ['deps/jquery.flot-0.8.2-alpha/jquery.flot.time.js']
                }, {
                    dest : 'deps/jquery.flot-0.8.2-alpha/minified/jquery-1.8.3-min.js',
                    src : ['deps/jquery.flot-0.8.2-alpha/jquery.js']
                }]
            }
        },

        // Minimize CSS files for release.
        //--------------------------------
        cssmin : {
            metoclient : {
                files : [{
                    dest : 'dist/css/style-min.css',
                    src : ['dist/css/style.css']
                }, {
                    dest : 'dist/components/animator/css/style-min.css',
                    src : ['dist/components/animator/css/style.css']
                }, {
                    dest : 'dist/components/graph/css/style-min.css',
                    src : ['dist/components/graph/css/style.css']
                }]
            }
        },

        // Clean build files or folders.
        //------------------------------
        clean : {
            all : {
                src : ['dist/']
            }
        },

        // Detect errors and potential problems in JavaScript code and enforce coding conventions.
        //----------------------------------------------------------------------------------------
        jshint : {
            all : ['src/**/*.js', 'dist/components/animator/js/animator-<%= pkg.version %>.js'],
            options : {
                "curly" : true,
                "eqeqeq" : true,
                "immed" : true,
                "latedef" : true,
                "newcap" : true,
                "noarg" : true,
                "sub" : true,
                "undef" : true,
                "boss" : true,
                "eqnull" : true,
                "node" : true,
                "globals" : {
                    "window" : true,
                    "navigator" : true,
                    "document" : true,
                    "OpenLayers" : true,
                    "jQuery" : true,
                    "Raphael" : true,
                    "_" : true,
                    "fi" : true,
                    "requestAnimationFrame" : true,
                    "timezoneJS" : true,
                    "CanvasRenderingContext2D" : true,
                    "XDomainRequest" : true
                }
            }
        },

        // Detect errors and potential problems in CSS code and enforce coding conventions.
        //---------------------------------------------------------------------------------
        csslint : {
            all : {
                src : ['src/**/*.css', 'dist/**/*.css', '!dist/deps/**', '!dist/**/*-min.css']
            },
            options : {
                // IE6 and earlier do not handle adjoining classes properly.
                // But, early IEs are not supported by this package anyways.
                // So, let the csslint pass if CSS contains adjoining classes.
                "adjoining-classes" : false
            }
        },

        // Replace strings inside files.
        //------------------------------
        "string-replace" : {
            // Distribution version information is included also in README.md file
            // that is copied into distribution folder.
            version : {
                files : [{
                    dest : 'dist/README.md',
                    src : ['src/README.md']
                }],
                options : {
                    replacements : [{
                        pattern : /<GRUNT_REPLACE_VERSION>/g,
                        replacement : '<%= pkg.version %>'
                    }]
                }
            },
            // "Use strict" definition should be included once to the beginning of the concatenated file.
            // Combined files may contain their own strict definitions which should be removed in the grunt flow.
            strict : {
                files : [{
                    dest : 'dist/components/animator/js/animator.js',
                    src : ['dist/components/animator/js/animator.js']
                }, {
                    dest : 'dist/components/graph/js/graph.js',
                    src : ['dist/components/graph/js/graph.js']
                }],
                options : {
                    replacements : [{
                        pattern : /"use strict";/gi,
                        replacement : '// "use strict";'
                    }]
                }
            }
        }
    });

    // Load the plugins that provide the required tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-string-replace');

    // Build MetOLib.
    // Notice, combined file is purged of strict definition lines and then strict definition is included to the beginning of the file before uglifying.
    grunt.registerTask('build', ['clean', 'copy', 'concat:components', 'string-replace', 'concat:intro', 'uglify:metoclient', 'cssmin:metoclient']);

    // Default task(s).
    // As a default, only local data is used for tests. Then, tests can be run also without connection for server data.
    // Notice, test can be run separately also for server data.
    grunt.registerTask('default', ['build', 'jshint', 'csslint']);

};
