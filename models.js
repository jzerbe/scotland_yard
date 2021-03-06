// data model loaded on client and server
function createStdCollectionLink(collectionName, collectionObj) {
    if (Meteor.isServer) {
        Meteor.publish(collectionName, function() {
            return collectionObj.find();
        });
    }
    if (Meteor.isClient) {
        Meteor.subscribe(collectionName);
    }
}


// map board position # to screen x,y
Positions = new Meteor.Collection("positions");
createStdCollectionLink("positions", Positions);


// maps of valid moves by various transportation means
Underground = new Meteor.Collection("underground");
createStdCollectionLink("underground", Underground);

Bus = new Meteor.Collection("bus");
createStdCollectionLink("bus", Bus);

Taxi = new Meteor.Collection("taxi");
createStdCollectionLink("taxi", Taxi);

Black = new Meteor.Collection("black"); // Mr. X only - river transit or any of above
createStdCollectionLink("black", Black);

// used in server-side initialization of transport collections
Meteor.Collection.prototype.putNodes = function(theNodeMap) {
    for (var theNode in theNodeMap) {
        theNeighbors = theNodeMap[theNode];

        var existingValue = this.findOne( { node: { $all: [theNode] } } );
        if (existingValue) {
            this.update(
                    { node: theNode },
                    { $set: { neighbors: theNeighbors } }
            );
        } else {
            this.insert( { node: theNode, neighbors: theNeighbors } );
        }
    }
};


// game rooms - only writable by game owner
Games = new Meteor.Collection("games");
Games.allow({ // define room owner vs reader perms
    insert: function(userId, game) { //userId === Meteor.userId()
        return userId && game.owner === userId;
    },
    update: function(userId, game) {
        return userId && game.owner === userId;
    },
    remove: function(userId, game) {
        return userId && game.owner === userId;
    },
    fetch: ['owner']
});
createStdCollectionLink("games", Games);


// log of the game - actions/chat
GameLog = new Meteor.Collection("gamelog");
GameLog.allow({ // only allow inserts and reads
    insert: function(userId, logitem) { //userId === Meteor.userId()
        return true;
    },
    update: function(userId, logitem) {
        return false;
    },
    remove: function(userId, logitem) {
        if (logitem && logitem.gameId) {
            var game = Games.findOne({_id: logitem.gameId});
            return game && game.owner === userId;
        }
        return false;
    },
    fetch: ['gameId']
});
createStdCollectionLink("gamelog", GameLog);
