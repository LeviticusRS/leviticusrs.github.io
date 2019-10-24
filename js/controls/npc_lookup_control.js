'use strict';

import {CanvasLayer} from '../external/L.CanvasLayer.js';
import Npcs from '../model/Npcs.js';
import {Position} from '../model/Position.js';

var MapNpcsCanvas = CanvasLayer.extend({
    setData: function (data) {
        this.needRedraw();
    },

    onDrawLayer: function (info) {
		if(this.npc) {
			var zoom = this._map.getZoom();
					
			var ctx = info.canvas.getContext('2d');
			ctx.clearRect(0, 0, info.canvas.width, info.canvas.height);

			var self = this;
			var locations = this.npc.points;
			for (var i in locations) {
				if (locations[i].z !== info.layer._map.plane) {
					continue;
				}
			
				// Scale each point.
				const radiusScaled =  0.10 * Math.pow(2, zoom);
				
				var position = locations[i];
				var latLng = position.toCentreLatLng(self._map);
				var canvasPoint = info.layer._map.latLngToContainerPoint(latLng);

				ctx.globalAlpha = 0.5;
				ctx.fillStyle = "red";
				ctx.strokeStyle = "red";
				ctx.beginPath();
				ctx.arc(canvasPoint.x, canvasPoint.y, radiusScaled, 0, 2 * Math.PI);
				ctx.stroke();
				ctx.fill();
				
			}
		}
    },
	
	setNpc: function(npc) {
		this.npc = npc;
	}
});

export var NpcLookupControl = L.Control.extend({
    options: {
        position: 'topleft',
    },

    onAdd: function (map) {
		map.createPane("map-npcs");
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        container.style.background = 'none';
        container.style.width = '200px';
        container.style.height = 'auto';

        var npcInput = L.DomUtil.create('input', 'leaflet-bar leaflet-control leaflet-control-custom', container);
        npcInput.id = 'npc-lookup';
        npcInput.type = 'text';
        npcInput.placeholder = "Search NPC";

        var self = this;
        Npcs.getNpcs(function(npcs) {
            var npcsArray = $.map(Object.values(npcs), function (value, key) {
                return {
                    label: value.name,
                    value: value
                }
            });
            self.npcs = npcsArray;
			
			self._mapNpcsCanvas = new MapNpcsCanvas({pane: "map-npcs"});
			self._map.addLayer(self._mapNpcsCanvas);

			map.on('planeChanged', function() {
				self._mapNpcsCanvas.drawLayer();
			}, self);

			$(npcInput).autocomplete({
				minLength: 2,
				source: function (request, response) {
					response($.ui.autocomplete.filter(self.npcs, request.term));
				},
				focus: function (event, ui) {
					$("#npc-lookup").val(ui.item.label);
					return false;
				},
				select: function (event, ui) {
					$("#npc-lookup").val(ui.item.label);
					self._mapNpcsCanvas.setNpc(ui.item.value);
					self._mapNpcsCanvas.drawLayer();
					return false;
				}
			});
        });
		

        L.DomEvent.disableClickPropagation(container);
        return container;
    },

});