import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Uploader from './uploader';

class MethodOne extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            images: []
        }
    }

    componentDidMount() {
    }

    render() {
        //code
        return (
            <>
                <Text>Method one</Text>
                    <Uploader />
            </>
        )
    }


}

export default MethodOne;