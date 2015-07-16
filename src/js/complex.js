module.exports = `package Game.Cars;

// Carr
message Car {

    // Car Vendor
    message Vendor {
        required string name = 1;

        // Car Vendor Address
        message Address {
            required string country = 1;
        }

        optional Address address = 2;
        repeated string models = 3;               // The models sold here.
    }

    required  string  model  = 1;                 // Model name
    required  Vendor  vendor = 2;                 // Vendor information
    optional  Speed   speed  = 3 [default=FAST];  // Car speed

    // Car speed enum
    enum Speed {
        FAST      = 1;
        SUPERFAST = 2;
    }

    // Car Holder
    message Holder {
        optional  string          first_name = 1;
        required  string          last_name  = 2;
        optional  Vendor.Address  address    = 3;
    }
}`;
