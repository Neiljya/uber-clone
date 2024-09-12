# Uber Clone - React Native & Node.js

This app is specifically for android (due to the lack of swift) and has two components: the driverside app and the passengerside app. 
As for the backend, the server is hosted in the **Node.js** environment.

## Prerequisites
- **Node.js**
- **React Native CLI**
- **Pusher account**
- **Google Maps API key**

### Testing Instructions

- To test the **driver code**, use the pusher app to push data for drivers. 
- To test the **passenger code**, connect your android device to the computer and run: 
react-native run-android

```bash
react-native run-android
```

## Documentation

### Dependencies

Ensure the following packages are installed:

```bash
npm install react-native-maps
npm install react-native-geocoding
npm install pusher-js
```
### Key Functionalities

- **Real-time Updates:** The app uses Pusher to subscribe passengers to available driver channels and manages passenger requests
- **Geolocation:** Starts tracking the real-time position of the driver

### Key Methods

- `componentwillmount`:
  - Sets up Pusher and subscribes passengers to available driver channels. It also handles passenger requests.
- `componentdidmount`:
  - Starts geolocation tracking, updates the driver's current location state, and handles proximity alerts and pickup/dropoff updates.
- `componentwillunmount`:
  - Clears the location tracking to stop tracking when the component is unmounted
- `render`:
  - Renders the driver's location on the map, and displays markers for both the driver and passenger's pickup location if applicable.

### File Structure

The code for the actual app is in app.js. The other files are used in app.js as components.
This part of the uber clone manages interactions with passengers, and notifies them when necessary. It leverages real-time updates using Pusher and geolocation services imported from react, ensuring a seamless experience.


## Passenger App Documentation

### Dependencies

Ensure the following packages are installed:

```bash
npm install react-native
npm install pusher-js/react-native
npm install react-native-google-place-picker
npm install react-native-geocoding
npm install react-native-maps
npm install react-native-loading-spinner-overlay
```

### Key Functionalities
- **Location Tracking & Map Integration:** Tracks the passenger's location and integrates Google Maps for choosing and viewing destinations in real-time
- **Ride Booking:** Allows passengers to book rides and send requests to available drivers
- **Real-time Updates:** Receives driver responses and tracks the ride and update with driver/passenger locations via Pusher

### Key Methods

- `bookride method`:
  - Opens Google Place Picker for the user to select a destination. It also sends a request to any available driver through the available driver channel. The passenger may cancel the ride by cancelling the selection of a destination. This sends a response to the driverside, which redirects the - `response`:
  - Says that the passenger has found another driver, in other words, cancelled the initial ride.
- `setcurrentlocation`
  - Gets the current location of the passenger and updates the state for the purpose of the map pointer display.
- `componentdidmount`
   - establishes pusher connections and handles requests for ride requests, driver responses, and location updates based on the ride. In particular, the app merges the passenger and driver's locations during the ride to ensure a smooth and clean interface in the app.
- `render`
   - renders UI components including the header, booking button, loading spinner, map, and markers for passenger and driver locations.
