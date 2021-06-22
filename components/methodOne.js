import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

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
            <Text>Hi lol, success!!!11!</Text>
        )
    }


}

export default MethodOne;