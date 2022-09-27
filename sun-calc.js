const suncalc = require('suncalc');

// Thanks to https://github.com/kcharwood/homebridge-suncalc/blob/master/index.js
const timeOfDay = (latitude, longitude) => {
  const nowDate = new Date();
  const now = nowDate.getTime();

  const sunDates = suncalc.getTimes(
    nowDate,
    latitude,
    longitude,
  );

  const times = {
    // dawn: sunDates.dawn.getTime(),
    sunrise: sunDates.sunrise.getTime(),
    // sunriseEnd: sunDates.sunriseEnd.getTime() + (1000 * 60),
    // sunsetStart: sunDates.sunsetStart.getTime() + (1000 * 60),
    sunset: sunDates.sunset.getTime(),
    // dusk: sunDates.dusk.getTime(),
  };

  if (now > times.sunset || now < times.sunrise) {
    // Nighttime
    return 1;
  } else { 
    return 0;
  } 
};

module.exports = timeOfDay;