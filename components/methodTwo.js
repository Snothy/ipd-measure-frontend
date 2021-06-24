import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import UploaderTwo from './uploaderTwo';

class MethodTwo extends React.Component {
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
                <Text>Method two</Text>
                    <UploaderTwo />
            </View>
        )
    }


}

export default MethodTwo;