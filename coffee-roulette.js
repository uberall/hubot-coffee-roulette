// Dependencies:
//  "cron": "1.0.9"
//  "lodash": "3.7.0"

var CronJob = require("cron").CronJob;
var _ = require("lodash");

var room = "#coffee";

module.exports = function(robot) {

    robot.messageRoom(room, "I am here to serve your coffee needs!");

    robot.hear(/coffee/i, function(response) {
        response.reply("You have been added to the coffee queue. Finding a partner! \r\n Say 'no coffee' to remove yourself from the list.");

        var user = response.message.user;

        robot.emit("userWantsCoffee", user);
    });

    robot.hear(/no coffee/i, function(response) {
        response.reply("You have been removed from the coffee queue. Boooo!");

        var user = response.message.user;

        var users = robot.brain.get("usersWhoWantCoffee");

        users = _.without(users, _.findWhere(users, function(userToRemove) {
            return userToRemove.id === user.id;
        }));

        robot.brain.set("usersWhoWantCoffee", users);
    });


    robot.on("userWantsCoffee", function(user) {
        var users = robot.brain.get("usersWhoWantCoffee");

        if (!users) {
            users = [];
        }

        if (!_.findWhere(users, user)) {
            robot.send(user, "You have been added to the coffee list! There are " + users.length + " other people in the coffee list");
            users.push(user);
        }

        robot.brain.set("usersWhoWantCoffee", users);
    });

    function announceAndMatch() {
        robot.messageRoom(room, "Matching coffee pairs now!");

        matchUsers();
    }

    function announceUpcomingCoffeeSelection() {
        robot.messageRoom(room, "Want coffee? say 'coffee'. Roulette will start in 5 minutes.");
    }

    var times = [10, 14, 16];

    for (var i = 0; i < times.length; i++) {
        new CronJob("00 00 " + times[i] + " * * 1-5", function() {
            announceAndMatch();
        }, null, true, "Europe/Paris");

        new CronJob("00 55 " + (times[i] - 1) + " * * 1-5", function() {
            announceUpcomingCoffeeSelection();
        }, null, true, "Europe/Paris");
    }

    function matchUsers() {
        var users = robot.brain.get("usersWhoWantCoffee");

        if (users.length > 1) {
            for (var i = 0; i < (users.length / 2); i++) {
                var user1 = getRandomUserFromListAndRemove();
                var user2 = getRandomUserFromListAndRemove();

                var announcement = "@" + user1.name + " and @" + user2.name;

                if (users.length === 3) {
                    var user3 = getRandomUserFromListAndRemove();    

                    announcement += " and @" + user3.name;
                }

                announcement += " should now have coffee!";

                robot.messageRoom(room, announcement);
            }
        } else if (users.length === 1) {
            robot.messageRoom(room, "Sorry @" + users[0].name + ", but no one wants to have coffee with you :(");
        }
    }

    function getRandomUserFromListAndRemove() {
        var users = robot.brain.get("usersWhoWantCoffee");

        users = _.shuffle(users);
        var randomUser = users.pop();
        robot.brain.set("usersWhoWantCoffee", users);

        return randomUser;
    }
};