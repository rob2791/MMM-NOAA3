/* Magic Mirror
 * Module: MMM-NOAA3
 * By Cowboysdude special Thanks to JimL from php help forum!
 */
var NodeHelper = require("node_helper");
var moment = require('moment');
var request = require('request');
const fs = require('fs');

module.exports = NodeHelper.create({

    config: {
		updateInterval:  5 * 1000,
        initialLoadDelay: 400000
    },
    provider: null,
    providers: {
        darksky: 'ds',
        openweather: 'ow',
        wunderground: 'wg',
        apixu: 'ax',
        weatherbit: 'wb',
        weatherunlocked: 'wu',
        accuweather: 'aw',
		Yahoo: 'yw',
    },

    start: function() {
        var self = this;
        setTimeout(function() {
//console.log(self.config.updateInterval);
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "MMM-NOAA3") {
            this.getLatLon();
            this.path = "modules/MMM-NOAA3/latlon.json";
            this.provider = this.getProviderFromConfig(payload);
            this.provider.addModuleConfiguration(payload);
			this.config = payload;
            this.getData();
            this.getSRSS();
            this.getAIR();
        }
        this.scheduleUpdate(this.config.updateInterval);
    },

    scheduleUpdate: function() {
        var self = this;
        self.updateInterval = setInterval(() => {
            console.log('NOAA3 weather updated.. next update in 1 hour');
            self.getData();
            self.getSRSS();
            self.getAIR();
        }, self.config.updateInterval);
    },

    getLatLon: function() {
        var self = this;
        request({
            url: "http://ip-api.com/json",
            method: 'GET'
        }, (error, response, body) => {
            if (self.provider) {
                var info = JSON.parse(body);
                var lat = info.lat;
                var lon = info.lon;
                var zip = info.zip;
                var city = info.city;
                info = {
                    lat: lat,
                    lon: lon,
                    zip: zip,
                    city: city
                };
                fs.writeFile(this.path, JSON.stringify(info),
                    function(error) {
                        return console.log("");
                    });
            }
        });
    },

    getData: function() {
        var self = this;
        self.provider.getData(function(response) {
            self.sendSocketNotification("WEATHER_RESULT", response ? response : 'NO_WEATHER_RESULT');
        });
    },

    getSRSS: function() {
        var self = this;
        self.provider.getSRSS(function(response) {
            self.sendSocketNotification("SRSS_RESULT", response ? response : 'NO_SRSS_DATA');
        });
    },

    getForecast: function() {
        var self = this;
        self.provider.getForecast(function(response) {
            self.sendSocketNotification("FORECAST_RESULT", response ? response : 'NO_FORECAST_DATA');
        });
    },

    getAIR: function() {
        var self = this;
        self.provider.getAIR(function(response) {
            self.sendSocketNotification("AIR_RESULT", response ? response : 'NO_AIR_DATA');
        });
    },

  /*  getALERT: function() {
        var self = this;
        self.provider.getALERT(function(response) {
            self.sendSocketNotification("ALERT_RESULT", response ? response : 'NO_ALERT_DATA');
        });
    }, */

    getProviderFromConfig: function(config) {
        if (!this.providers[config.provider]) {
            throw new Error('Invalid config No provider selected');
        }
        return require('./providers/' + this.providers[config.provider] + '.js');
    }
});