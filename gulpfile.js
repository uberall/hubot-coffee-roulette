var gulp = require("gulp");

gulp.task('default', function() {
    gulp.watch("coffee-roulette.js", function(evt) {
        gulp.src("coffee-roulette.js")
            .pipe(gulp.dest("../hubot/scripts/"));
    });
});