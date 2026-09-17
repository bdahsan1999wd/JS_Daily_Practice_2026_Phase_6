// 🧩 PROBLEM–02: buildSensorSystem()

// Logic: This function builds a sensor monitoring system with getters/setters
// for temperature conversion (C/F/K), humidity validation, and alert
// generation based on configurable thresholds.

function buildSensorSystem(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.systemName !== 'string' ||
        !["C", "F", "K"].includes(config.tempUnit) ||
        typeof config.alertThresholds !== 'object' ||
        config.alertThresholds === null
    ) {
        return "Invalid Input";
    }
    const { minTemp, maxTemp, maxHumidity } = config.alertThresholds;
    if (typeof minTemp !== 'number' || typeof maxTemp !== 'number' || typeof maxHumidity !== 'number') {
        return "Invalid Input";
    }

    // --- STEP 2: DEFINE SENSOR CLASS ---
    class Sensor {
        constructor(sensorId, location) {
            // Private state
            let _rawTemp = 0; // stored in Celsius
            let _humidity = 0;
            const _readingLog = [];
            let _readCounter = 0;

            // --- GETTERS ---
            Object.defineProperty(this, 'sensorId', { value: sensorId, enumerable: true });
            Object.defineProperty(this, 'location', { value: location, enumerable: true });

            Object.defineProperty(this, 'temperature', {
                get: () => {
                    switch (config.tempUnit) {
                        case "F": return Math.round((_rawTemp * 9 / 5) + 32);
                        case "K": return Math.round(_rawTemp + 273.15);
                        default: return _rawTemp;
                    }
                },
                set: (val) => {
                    if (typeof val !== 'number' || val < -100 || val > 100) {
                        throw new Error("Invalid Temperature");
                    }
                    _rawTemp = val;
                },
                enumerable: true
            });

            Object.defineProperty(this, 'humidity', {
                get: () => _humidity,
                set: (val) => {
                    if (typeof val !== 'number' || val < 0 || val > 100) {
                        throw new Error("Invalid Humidity");
                    }
                    _humidity = val;
                },
                enumerable: true
            });

            Object.defineProperty(this, 'status', {
                get: () => {
                    // Temperature out of range = Critical
                    if (_rawTemp < minTemp || _rawTemp > maxTemp) {
                        return "Critical";
                    }
                    // Humidity high = Warning (per sample)
                    if (_humidity > maxHumidity) {
                        return "Warning";
                    }
                    // Near temperature bounds = Warning
                    if (_rawTemp < minTemp + 5 || _rawTemp > maxTemp - 5) {
                        return "Warning";
                    }
                    return "Normal";
                },
                enumerable: true
            });

            Object.defineProperty(this, 'readingCount', {
                get: () => _readingLog.length,
                enumerable: true
            });

            // --- METHODS ---
            this.logReading = () => {
                _readCounter++;
                _readingLog.push({
                    timestamp: _readCounter,
                    temperature: _rawTemp,
                    humidity: _humidity
                });
            };

            this.getAlerts = () => {
                const alerts = [];
                if (_humidity > maxHumidity) alerts.push(`Humidity too high: ${_humidity}%`);
                if (_rawTemp > maxTemp) alerts.push(`Temperature too high: ${_rawTemp}°C`);
                if (_rawTemp < minTemp) alerts.push(`Temperature too low: ${_rawTemp}°C`);
                return alerts;
            };

            this.getHistory = () => {
                return _readingLog.slice(-5).map(r => ({
                    timestamp: r.timestamp,
                    temperature: r.temperature,
                    humidity: r.humidity
                }));
            };
        }
    }

    // --- STEP 3: INITIALIZE SYSTEM STATE ---
    const sensors = new Map(); // sensorId -> Sensor

    // --- STEP 4: DEFINE SENSOR API ---
    function addSensor(sensorId, location) {
        if (typeof sensorId !== 'string' || typeof location !== 'string') {
            return "Invalid Input";
        }
        if (sensors.has(sensorId)) return "Sensor Exists";
        const sensor = new Sensor(sensorId, location);
        sensors.set(sensorId, sensor);
        return sensor;
    }

    function getSensor(sensorId) {
        return sensors.get(sensorId) || null;
    }

    function getSystemAlert() {
        const critical = [];
        for (const sensor of sensors.values()) {
            if (sensor.status === "Critical") {
                critical.push({ sensorId: sensor.sensorId, location: sensor.location });
            }
        }
        return critical;
    }

    function getSystemReport() {
        let criticalCount = 0;
        let warningCount = 0;
        for (const sensor of sensors.values()) {
            if (sensor.status === "Critical") criticalCount++;
            else if (sensor.status === "Warning") warningCount++;
        }
        return {
            systemName: config.systemName,
            totalSensors: sensors.size,
            criticalCount,
            warningCount
        };
    }

    // --- STEP 5: RETURN API ---
    return {
        addSensor,
        getSensor,
        getSystemAlert,
        getSystemReport
    };
}


// --- EXAMPLE USAGE ---
const system = buildSensorSystem({ systemName: "FactorySensors", tempUnit: "F", alertThresholds: { minTemp: 10, maxTemp: 40, maxHumidity: 80 } });

system.addSensor("S01", "Room A");
const s = system.getSensor("S01");
s.temperature = 35;
s.humidity = 85;

console.log(s.temperature);
console.log(s.status);
console.log(s.getAlerts());
s.logReading();
console.log(system.getSystemReport());


// --- Invalid Input ---
console.log(buildSensorSystem("invalid"));