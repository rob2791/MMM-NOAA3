/* Magic Mirror
 * Module: MMM-NOAA3
 * By cowboysdude 
 */
var request = require('request');
const moment = require('moment');
const fs = require('fs');
var lat, lon, zip, city;
var current;
     
 var provider = {
        config: {
        },
    imageArray: {
            "3":	"tstorms",
			"4":	"tstorms",
			"5":	"chancesleet",
			"6":	"chancesleet",
			"7":	"chancesleet",
			"8":	"sleet",
			"9":	"drizzle",
			"10":	"sleet",
			"11":	"rain",
			"12":	"rain",
			"13":	"flurries",
			"14":	"snow",
			"15":	"snow",
			"16":	"snow",
			"17":	"NA",
			"18":	"sleet",
			"19":	"hazy",
			"20":	"fog",
			"21":	"hazy",
			"22":	"hazy",
			"23":	"wind",
			"24":	"wind",
			"25":	"NA",
			"26":	"cloudy",
			"27":	"partlycloudy",
			"28":	"partlycloudy",
			"29":	"partlycloudy",
			"30":	"partlycloudy",
			"31":	"clear",
			"32":	"clear",
			"33":	"clear",
			"34":	"clear",
			"35":	"chancesleet",
			"36":	"clear",
			"37":	"tstorms",
			"38":	"tstorms",
			"39":	"tstorms",
			"40":	"rain",
			"41":	"snow",
			"42":	"snow",
			"43":	"snow",
			"44":	"partlycloudy",
			"45":	"tstorms",
			"46":	"snow",
			"47":	"tstorms"
        }, 
	
           addModuleConfiguration: function(moduleConfig) {
               if(!moduleConfig.airKey) {
                   throw new Error('Invalid config');
            }
           this.config.apiKey = moduleConfig.apiKey;
 		   this.config.airKey = moduleConfig.airKey;
		   this.config.userlat = moduleConfig.userlat;
		   this.config.userlon = moduleConfig.userlon;
		   this.config.lang = moduleConfig.language;
 		/*   var text = fs.readFileSync('modules/MMM-NOAA3/latlon.json','utf8')
           var info = JSON.parse(text);
		   lat = info.lat;
		   lon = info.lon;
		   zip = info.zip;
		   city = info.city;
		   */
        },
		
    getData: function(callback) {
        var self = this;
		url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22"+city+"%2C%20ny%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
       
		
		request(url, function(error, response, body) {
            if (error) {
                console.log("Error: " + err.message);
                callback(null);
            }
            callback(self.parseResponse(body));
        });
    },

    getSRSS: function(callback) {
         var self = this; 
          url = "https://api.sunrise-sunset.org/json?lat="+this.config.userlat+"&lng="+this.config.userlon+"&formatted=0";
		console.log(url);
         request(url, function(error, response, body) {
             if (error) {
                 console.log("Error: " + err.message);
                 callback(null);
             }
             callback(self.parseSRSS(body));
         });
     },

    getAIR: function(callback) {
        var self = this;
        url = "http://api.airvisual.com/v2/nearest_city?lat=" + this.config.userlat + "&lon=" + this.config.userlon + "&rad=100&key="+this.config.airKey
        //+this.config.airKey;
        request(url, function(error, response, body) {
            if (error) {
                console.log("Error: " + err.message);
                callback(null);
            }
            callback(self.parseAIR(body));
        });
    },

    getALERT: function(callback) {
        var self = this;
        url = "http://api.wunderground.com/api/a4d00a39e75848da/alerts/q/pws:KPALANCA9.json"
        request(url, function(error, response, body) {
            if (error) {
                console.log("Error: " + err.message);
                callback(null);
            }
            callback(self.parseALERT(body));
        });
    },

    parseALERT: function(response) {
        var alert = JSON.parse(response);
        if (this.config.lang == "en" && alert != "undefined" || null) {
            alert = {
                alert: alert
            };
        } else {
            for (var i = 0; i < alert.length; i++) {
                var alerts = alert[i];
                if (alerts != undefined) {
                    if (this.config.lang != 'en') {
                        Promise.all([
                            translate(alerts.description, {
                                from: 'en',
                                to: this.config.lang
                            })
                        ]).then(function(results) {
                            var desc = results[0].text;
                            var level = 2;
                            var level = alerts.level_meteoalarm;
                            alert = {
                                desc,
                                level
                            };
                        })
                    } else {
                        var desc = alerts.description;
                        var level = 2;
                        alert = {
                            desc,
                            level
                        };
                    }

                } else {
                    alert = {
                        desc,
                        level
                    };
                }
            }
        };

        return alert;
    },


    parseResponse: function(response) {
        var weather = JSON.parse(response);
		var result = weather.query.results.channel;
		forecast =  result.item.forecast;
		 for (var i = 0; i < forecast.length; i++) {
             forecast[i] = forecast[i];
		
	  var newDay = {
                 date: {
                     weekday_short: forecast[i].day
                 }
             };
             forecast[i] = Object.assign(forecast[i], newDay);
			 
			 
             var highF = forecast[i].high;
             var lowF = forecast[i].low;

             function toCelsius(f) {
                 return (5 / 9) * (f - 32);
             }
             var highC = toCelsius(forecast[i].high);
             var lowC = toCelsius(forecast[i].low);
             var high = {
                 high: {
                     fahrenheit: highF,
                     celsius: highC
                 }
             };
             var low = {
                 low: {
                     fahrenheit: lowF,
                     celsius: lowC
                 }
             };
			 var desc = forecast[i].text;
			 var description = { 
			                    desc: {
									   desc
									   }
									   };
			 forecast[i] = Object.assign(forecast[i], description);
			 let icony = { icon:this.imageArray[forecast[i].code]};

			 forecast[i] = Object.assign(forecast[i], icony);
			 forecast[i] = Object.assign(forecast[i], high);
             forecast[i] = Object.assign(forecast[i], low);
			 forecast.push(forecast[i]);
             forecast = forecast.slice(0, 4);
	};
		
     current = {
			 current: {
			     weather: result.item.condition.text,
                 temp_f: result.item.condition.temp,
				 temp_c: toCelsius(result.item.condition.temp),
                 icon: this.imageArray[result.item.condition.code],
                 relative_humidity: result.atmosphere.humidity+"%",
                 pressure_in: Math.round(result.atmosphere.pressure*0.02953),
                 pressure_mb: result.atmosphere.pressure,				 
                 UV: "NA",
                 visibility_mi: result.atmosphere.visibility,
				 visibility_km: (result.atmosphere.visibility*1.609344),
                 wind_mph: result.wind.speed,
				 wind_kph: (result.wind.speed*1.60934),
			      forecast: {
    "0": {fcttext:result.item.condition.text,fcttext_metric:result.item.condition.text},
    "1": {fcttext:result.item.condition.text,fcttext_metric:result.item.condition.text}
				  }
			   },
        };

        return {
            current,
            forecast
        }; 
    },

    parseAIR: function(response) {
        var air = JSON.parse(response);
        airdata = {
            air: air.data.current.pollution
        }
        return airdata;
    },

     parseSRSS: function(response) {
         var srss = JSON.parse(response);
         sun = {
             sunrise: srss.results.sunrise,
             sunset: srss.results.sunset,
             day: srss.results.day_length
         }
         return sun;
     },
};

if (typeof module !== "undefined") {
    module.exports = provider;
}