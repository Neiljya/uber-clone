import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert
} from 'react-native';
import Pusher from 'pusher-js/react-native';
import MapView from 'react-native-maps';

import Geocoder from 'react-native-geocoding';
Geocoder.setApiKey('null');
import { regionFrom, getLatLonDiffInMeters } from './helpers';

export default class grabDriver extends Component{
    state = {passenger: null, region: null, accuracy: null, nearby_alert: false, has_passenger: false, has_ridden: false} //passenger info, curr loc, accuracy of loc, nearby alert issued, driver has passenger, passenger has ridden
    constructor() {
        super();
        this.available_drivers_channel = null; // send request to driver
        this.ride_channel = null; // curr loc
        this.pusher = null; // pusher client
    }
    componentWillMount() {
        this.pusher = new Pusher('[pusher key]', 
            {authEndpoint: 'pusher server endpoint', 
             cluster: 'pusher cluster',
             encrypted: true
            });
        this.available_drivers_channel = this.pusher.subscribe('private-available-drivers');
        // listen to driver request event
        this.available_drivers_channel.bind('client-driver-request', (passenger_data) => {
            if(!this.state.has_passenger){ //if driver has no passenger, alert that they have request
                Alert.alert("You got a passenger!", "Pickup: " + passenger_data.pickup.name + "\nDrop off: " + passenger_data.dropoff.name, 
                    [
                        {
                            text: "Later bro", //reject request
                            onPress: () => {
                                console.log('Cancel Pressed');
                            },
                            style: 'cancel'
                        },
                        {
                            text: "Gotcha!", //accept request
                            onPress: () => {
                                this.ride_channel = this.pusher.subscribe('private-ride-' + passenger_data.username);
                                this.ride_channel.bind('pusher:subscription_succeeded', () => { //send handshake event to pass
                                    this.ride_channel.trigger('client-driver-response', {response: 'yes'}); //yes = available
                                
                                    this.ride_channel.bind('client-driver-response', (driver_response) => { //listen for acknowledgement
                                        if(driver_response.response == 'yes'){ //passenger says yes
                                            this.setState({ //passenger has no ride and has not ridden
                                                has_passenger: true, 
                                                passenger: {
                                                    username: passenger_data.username, 
                                                    pickup: passenger_data.pickup,
                                                    dropoff: passenger_data.dropoff
                                                }
                                            });
                                            Geocoder.getFromLatLng(this.state.region.latitude, this.state.region.longitude).then(
                                                (json) => {
                                                    var address_component = json.results[0].address_components[0];
                                                    this.ride_channel.trigger('client-found-driver', { //client found driver
                                                        driver: {
                                                            name: 'John Doe'
                                                        }, 
                                                        location: {
                                                            name: address_component.long_name,
                                                            latitude: this.state.region.latitude,
                                                            longitude: this.state.region.longitude,
                                                            accuracy: this.state.accuracy
                                                        }
                                                    });
                                                }, 
                                                (error) => {
                                                    console.log('err geocoding: ', error);
                                                }
                                            );
                                        }
                                        else{
                                            Alert.alert( //passenger already found ride, declined
                                                "Too late!",
                                                "Another driver beat you to it.",
                                                [
                                                    {
                                                        text: "Ok"
                                                    },
                                                ],
                                                {cancelable: false} //no cancel button
                                            );
                                        }
                                    });
                                });
                            }
                        },
                    ],
                    {cancelable: false} //no cancel button
                );
            }
        });
    }
    //component has mounted here
    componentDidMount() {
        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                var region = regionFrom(
                    position.coords.latitude, 
                    position.coords.longitude,
                    position.coords.accuracy
                );
                //update UI
                this.setState({
                    region: region, 
                    accuracy: position.coords.accuracy
                });
                if(this.state.has_passenger && this.state.passenger){
                    var diff_in_meter_pickup = getLatLonDiffInMeters(
                        position.coords.latitude, position.coorde.longitude, this.state.passenger.pickup.latitude, this.state.passenger.pickup.longitude
                    );
                    if(diff_in_meter_pickup <= 20){ //inform client that driver is very near
                        if(!this.state.has_ridden){
                            this.ride_channel.trigger('client-driver-message', {
                                type: 'near_pickup', 
                                title: "Just a heads up",
                                msg: "Your driver is near, get in an easily visible location."
                            }); //assume passenger has gotten into vehicle
                            this.setState({
                                has_ridden: true
                            });
                        }
                    }
                    else if(diff_in_meter_pickup <= 50){
                        if(!this.state.nearby_alert){ //this alert will happen 5 times if we dont check if nearby alert has already been triggered (bad)
                            this.setState({
                                nearby_alert: true
                            });
                            Alert.alert(
                                "Slow down", 
                                "Your passenger is just around the corner",
                                [
                                    {
                                        text: "Gotcha!"
                                    },
                                ],
                                {cancelable: false}
                            );
                        }
                    }
                    var diff_in_meter_dropoff = getLatLonDiffInMeters(
                        position.coords.latitude, position.coords.longitude, this.state.passenger.dropoff.latitude, this.state.passenger.dropoff.longitude
                    );
                    if (diff_in_meter_dropoff <= 20){
                        this.ride_channel.trigger('client-driver-message', {
                            type: 'near_dropoff',
                            title: "Get ready",
                            msg: "You are very close to your destination. Please prepare your payment method."
                        });
                        this.ride_channel.unbind('client-driver-response'); //remove passenger event from driver cache
                        this.pusher.unsubscribe('private-ride-' + this.state.passenger.username); //disconnect passenger channel
                        this.setState({
                            passenger: null, 
                            has_passenger: false,
                            has_ridden: false
                        });
                    }
                    this.ride_channel.trigger('client-driver-location', { 
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                }
            },
            (error) => this.setState({error: error.message}), 
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 1000,
                distanceFilter: 10
            }, 
        );
    }
    componentWillUnmount() { //stop location watcher
        navigator.geolocation.clearWatch(this.watchId);
    }
    render() { //displays the map and the markers for the driver (passenger already cleared)
        return (
          <View style={styles.container}>
            {
              this.state.region && 
              <MapView
                style={styles.map}
                region={this.state.region}
              >
                  <MapView.Marker
                    coordinate={{
                    latitude: this.state.region.latitude, 
                    longitude: this.state.region.longitude}}
                    title={"You're here"}
                  />
                  
                  {
                    this.state.passenger && !this.state.has_ridden && 
                    <MapView.Marker
                      coordinate={{
                      latitude: this.state.passenger.pickup.latitude, 
                      longitude: this.state.passenger.pickup.longitude}}
                      title={"Your passenger is here"}
                      pinColor={"#4CDB00"}
                    />
                  }
              </MapView>
            }
          </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
  });

