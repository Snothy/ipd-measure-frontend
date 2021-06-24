import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
    NativeRouter as Router,
    Switch,
    Route
} from 'react-router-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

//Add sidebar to select different methods
//Import components
//import home ....
import Home from './components/home';
import MethodOne from './components/methodOne';
import MethodTwo from './components/methodTwo';

const Drawer = createDrawerNavigator();

export default class App extends React.Component {
    render() {
        return (
            <>

            <NavigationContainer>
                <Drawer.Navigator initialRouteName="Home">
                    <Drawer.Screen name="Home" component={Home}/>
                    <Drawer.Screen name="methodOne" component={MethodOne}/>
                    <Drawer.Screen name="methodTwo" component={MethodTwo}/>
                </Drawer.Navigator>
            </NavigationContainer>
            </>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


/*
                    <Text>Open up App.js to start working on your app!</Text>
                    <StatusBar style="auto" />
*/