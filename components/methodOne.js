import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Uploader from './uploader';

class MethodOne extends React.Component {
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
            <View style={{    
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 100}}>
                <Text>Method one</Text>
                    <Uploader />
            </View>
        )
    }


}

export default MethodOne;