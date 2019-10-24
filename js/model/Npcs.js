'use strict';

import {Position} from './Position.js';

class Npcs {

    constructor() {
        this.npcs = {};
    }
    
    getNpcs(callback) {
        if (Object.keys(this.npcs).length > 0) {
            callback(this.npcs);
            return;
        }
        
        $.ajax({
            url: "resources/npcs.json",
            dataType: "json",
            context: this,
            success: function( data ) {
                var names = data["names"];
				var spawns = data["spawns"];
                
				var name_map = {};
				for(var n in names) {
					name_map[names[n].id] = names[n].name;
				}
				for (var i in spawns) {
					var id = spawns[i].npc;
					var name = name_map[id];
					var points = [];
					spawns[i].points.forEach(function(p) {
						points.push(new Position(p.x + 6, p.y, p.plane));
					});
					if(this.npcs[name] == undefined) {
						this.npcs[name] = {
							"name": name_map[id],
							"points": points,
						};
					} else {
						this.npcs[name].points = this.npcs[name].points.concat(points);
					}
                }
                callback(this.npcs);
            },
			error: function(a, b, c) {
				console.log(b + " " + c);
			},
        });
    }
}

export default (new Npcs);