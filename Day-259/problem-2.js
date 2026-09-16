// 🧩 PROBLEM–02: buildVehicleFleet()

// Logic: This function builds a vehicle fleet management system using
// ES6 classes. Vehicle is the base class, with Car and Truck as subclasses.
// The fleet API manages vehicles and generates reports.


function buildVehicleFleet(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.fleetName !== 'string' ||
        typeof config.fuelPricePerLiter !== 'number'
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: DEFINE VEHICLE CLASS ---
    class Vehicle {
        constructor(brand, model, year, fuelCapacity) {
            this.brand = brand;
            this.model = model;
            this.year = year;
            this.fuelCapacity = fuelCapacity;
            this.currentFuel = 0;
        }

        refuel(liters) {
            if (typeof liters !== 'number' || liters <= 0) return "Invalid Amount";
            this.currentFuel = Math.min(this.currentFuel + liters, this.fuelCapacity);
            return this.currentFuel;
        }

        getFuelStatus() {
            return {
                current: this.currentFuel,
                capacity: this.fuelCapacity,
                percentage: Math.round((this.currentFuel / this.fuelCapacity) * 100)
            };
        }

        getInfo() {
            return `Brand: ${this.brand}, Model: ${this.model}, Year: ${this.year}`;
        }
    }

    // --- STEP 3: DEFINE CAR CLASS ---
    class Car extends Vehicle {
        constructor(brand, model, year, fuelCapacity, seats) {
            super(brand, model, year, fuelCapacity);
            this.seats = seats;
        }

        drive(km, kmPerLiter) {
            if (typeof km !== 'number' || typeof kmPerLiter !== 'number' || km <= 0 || kmPerLiter <= 0) {
                return "Invalid Input";
            }
            const fuelUsed = km / kmPerLiter;
            if (fuelUsed > this.currentFuel) {
                return "Insufficient Fuel";
            }
            this.currentFuel -= fuelUsed;
            return {
                kmDriven: km,
                fuelUsed: Math.round(fuelUsed * 100) / 100,
                remaining: Math.round(this.currentFuel * 100) / 100
            };
        }

        getInfo() {
            return `Car: ${this.brand} ${this.model}, Seats: ${this.seats}`;
        }
    }

    // --- STEP 4: DEFINE TRUCK CLASS ---
    class Truck extends Vehicle {
        constructor(brand, model, year, fuelCapacity, payloadTons) {
            super(brand, model, year, fuelCapacity);
            this.payloadTons = payloadTons;
            this.currentCargo = 0;
        }

        loadCargo(tons) {
            if (typeof tons !== 'number' || tons < 0) return "Invalid Amount";
            if (tons > this.payloadTons) return "Overloaded";
            this.currentCargo = tons;
            return this.currentCargo;
        }

        getInfo() {
            return `Truck: ${this.brand} ${this.model}, Payload: ${this.payloadTons} tons`;
        }
    }

    // --- STEP 5: INITIALIZE FLEET STATE ---
    const vehicles = new Map(); // "brand-model" -> vehicle instance

    // --- STEP 6: DEFINE ADDCAR ---
    function addCar(brand, model, year, fuelCapacity, seats) {
        if (typeof brand !== 'string' || typeof model !== 'string' ||
            typeof year !== 'number' || typeof fuelCapacity !== 'number' ||
            typeof seats !== 'number') {
            return "Invalid Input";
        }
        const key = `${brand}-${model}`;
        if (vehicles.has(key)) {
            return "Vehicle Exists";
        }
        const car = new Car(brand, model, year, fuelCapacity, seats);
        vehicles.set(key, car);
        return car;
    }

    // --- STEP 7: DEFINE ADTRUCK ---
    function addTruck(brand, model, year, fuelCapacity, payloadTons) {
        if (typeof brand !== 'string' || typeof model !== 'string' ||
            typeof year !== 'number' || typeof fuelCapacity !== 'number' ||
            typeof payloadTons !== 'number') {
            return "Invalid Input";
        }
        const key = `${brand}-${model}`;
        if (vehicles.has(key)) {
            return "Vehicle Exists";
        }
        const truck = new Truck(brand, model, year, fuelCapacity, payloadTons);
        vehicles.set(key, truck);
        return truck;
    }

    // --- STEP 8: DEFINE GETVEHICLE ---
    function getVehicle(brand, model) {
        return vehicles.get(`${brand}-${model}`) || null;
    }

    // --- STEP 9: DEFINE GETFLEETREPORT ---
    function getFleetReport() {
        let totalCars = 0;
        let totalTrucks = 0;
        let totalFuelCapacity = 0;

        for (const vehicle of vehicles.values()) {
            totalFuelCapacity += vehicle.fuelCapacity;
            if (vehicle instanceof Car) totalCars++;
            else if (vehicle instanceof Truck) totalTrucks++;
        }

        return {
            totalVehicles: vehicles.size,
            totalCars,
            totalTrucks,
            totalFuelCapacity
        };
    }

    // --- STEP 10: RETURN API ---
    return {
        addCar,
        addTruck,
        getVehicle,
        getFleetReport
    };
}


// --- EXAMPLE USAGE ---
const fleet = buildVehicleFleet({ fleetName: "SpeedFleet", fuelPricePerLiter: 110 });

fleet.addCar("Toyota", "Corolla", 2022, 50, 5);
fleet.addTruck("Volvo", "FH16", 2021, 300, 20);

console.log(fleet.getVehicle("Toyota", "Corolla").refuel(30));
console.log(fleet.getVehicle("Toyota", "Corolla").drive(100, 15));
console.log(fleet.getVehicle("Volvo", "FH16").getInfo());
console.log(fleet.getFleetReport());

// --- Invalid Input ---
console.log(buildVehicleFleet("invalid"));