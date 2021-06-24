import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount() {
    }

    render() {
        //code
        return (
            <>
            <View style={{    justifyContent: 'center',
            alignItems: 'center',
            height: 100}}>
                <Text>Home</Text>
                <Text>Drag the sidebar and select a method.</Text>
            </View>
            </>
        )
    }


}

export default Home;