import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
    NativeRouter as Router,
    Switch,
    Route
} from 'react-router-native';

//Add sidebar to select different methods
//Import components
//import home ....
import MethodOne from './components/methodOne';

export default class App extends React.Component {
    render() {
        return (
            <Router>
                <View style={styles.container}>
                    <Switch>
                        <Route exact path="/" component={MethodOne} />
                    </Switch>
                </View>
            </Router>
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