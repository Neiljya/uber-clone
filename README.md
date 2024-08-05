uber clone using react and node.js

This app is specifically for android (due to the lack of swift) and has two components: the driverside app and the passengerside app. 
As for the backend, the server is hosted in the node.js environment.

To test the driver code, use the pusher app to push data for drivers. 
To test the passenger code, connect your android device to the computer and run: 
react-native run-android

In detail documentation for driver-app: 
Make sure you have the necessary packages installed, using 
npm install react-native-maps
npm install react-native-geocoding
npm install pusher-js

It requires the following dependencies:
react-native
pusher-js/react-native
react-native-maps
react-native-geocoding

The componentwillmount method sets up Pusher and subscribes passengers to available driver channels. It also handles passenger requests.
The componentdidmount method starts geolocation tracking, updates the driver's current location state, and handles proximity alerts and pickup/dropoff updates.
The componentwillunmount method clears the location tracking to stop tracking when the component is unmounted
The render method renders the driver's location on the map, and displays markers for both the driver and passenger's pickup location if applicable.

The code for the actual app is in app.js. The other files are used in app.js as components.
This part of the uber clone manages interactions with passengers, and notifies them when necessary. It leverages real-time updates using Pusher and geolocation services imported from react, ensuring a seamless experience.

In detail documentation for passenger-app:
This app has the key functionalities of location tracking, ride booking, real-time updates, map integration, and more.
This app also requires the following dependencies:
react-native
pusher-js/react-native
react-native-google-place-picker
react-native-geocoding
react-native-maps
react-native-loading-spinner-overlay

There are a few more imports compared to the driver-side app, because there are some specific things from react, such as the spinner, that improves the aesthetic experience of the passenger app.
The bookride method opens Google Place Picker for the user to select a destination. It also sends a request to any available driver through the available driver channel. The passenger may cancel the ride by cancelling the selection of a destination. This sends a response to the driverside, which redirects the response to say that the passenger has found another driver, in other words, cancelled the initial ride.
The setcurrentlocation method gets the current location of the passenger and updates the state for the purpose of the map pointer display.
The componentdidmount method establishes pusher connections and handles requests for ride requests, driver responses, and location updates based on the ride. In particular, the app merges the passenger and driver's locations during the ride to ensure a smooth and clean interface in the app.
The render method renders UI components including the header, booking button, loading spinner, map, and markers for passenger and driver locations.
