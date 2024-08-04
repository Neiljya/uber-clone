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

The code for the actual app is in app.js. The other files are used in app.js as components.
This part of the uber clone manages interactions with passengers, and notifies them when necessary. It leverages real-time updates using Pusher and geolocation services imported from react, ensuring a seamless experience.

In detail documentation for passenger-app:
