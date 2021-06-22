import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {Button} from 'antd-mobile-rn';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';


class Uploader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasPermission: null,
            type: null,
            faceDetected: false,
            smiling: false
        }
        this.handleFacesDetected = this.handleFacesDetected.bind(this);
    }

    async componentDidMount() {
        this.setState({ hasPermission: null });
        this.setState({ type: Camera.Constants.Type.front }); //default to front facing camera
        
        const{ status } = await Camera.requestPermissionsAsync();
        this.setState({ hasPermission: status === 'granted' });
    }


    handleFacesDetected({faces}) {
        if(faces.length > 0) {
            this.setState({ faceDetected: true });
            //console.log(faces[0].smilingProbability);
            if(faces[0].smilingProbability > 60/100) {
                this.setState({ smiling: true });
            } else {
                this.setState({ smiling: false });
            }
        } else {
            this.setState({ faceDetected: false });
            this.setState({ smiling: false });
        }

    }

    componentDidUpdate() {   
    }


    render() {
        //Just guaranteeing the application has permissions to access the device's camera
        if (this.state.hasPermission === null) {
        return <View />;
        }
        if (this.state.hasPermission === false) {
        return <Text>No access to camera</Text>;
        }
    
        return (
            <>
                <Camera style={styles.camera} type={this.state.type}
                
                onFacesDetected={this.handleFacesDetected}
                faceDetectorSettings={{
                  mode: FaceDetector.Constants.Mode.accurate,
                  detectLandmarks: FaceDetector.Constants.Landmarks.all,
                  runClassifications: FaceDetector.Constants.Classifications.all,
                  minDetectionInterval: 100,
                  tracking: true
                }}
                >
                    <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                        this.setState({

                            type: this.state.type === Camera.Constants.Type.front
                            ? Camera.Constants.Type.back
                            : Camera.Constants.Type.front
                            });
                        }}>
                        <Text style={styles.text}> Flip </Text>
                    </TouchableOpacity>
                    </View>
                </Camera>
                <Button type="primary" htmlType="submit">
                    Test button
                </Button>
                {this.state.faceDetected
                ? <Text>DETECTED FACE</Text>
                : <Text>NOT DETECTED</Text>}

                {this.state.smiling
                ? <Text>SMILING</Text>
                : <Text>NOT SMILING</Text>}
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
    camera: {
        width: 300,
        height: 400,
    }
  });

export default Uploader;