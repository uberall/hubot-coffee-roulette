var gulp = require("gulp");

gulp.task('default', function() {
    gulp.watch("./src/**", function(evt) {
        gulp.src("./src/**")
            .pipe(gulp.dest("./target/"));
    });
});