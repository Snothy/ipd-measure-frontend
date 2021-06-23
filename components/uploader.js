import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import {Button} from 'antd-mobile-rn';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';


class Uploader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasPermission: null,    //whether the application has permission to access the device's camera
            type: null,             //which camera is currently in use
            faceData: [],           //The data about the face collected from the Google Mobile Vision framework
            faceDetected: false,    //whether a face is detected in frame
            photo_style: {
                position: 'relative',
                width: 480,
                height: 480
            },
            //smiling: false          //whether the subject is smiling
            eyesOpen: true         //whether the subject's eyes are open (they need to be)
        }
        this.handleFacesDetected = this.handleFacesDetected.bind(this); //the handler needs access to state
        this.faceSquare = this.faceSquare.bind(this);
    }

    async componentDidMount() {
        this.setState({ hasPermission: null });
        this.setState({ type: Camera.Constants.Type.front }); //default to front facing camera
        
        const{ status } = await Camera.requestPermissionsAsync(); // equivalent to 'granted' if the user has given permission to use the camera to the application
        this.setState({ hasPermission: status === 'granted' });
    }

    /**
     * This function updates the state upon detecting a face in frame
     * @param {faces} - Array of objects with data about the faces inside the frame (camera frame)
     */
    handleFacesDetected({faces}) {
        //dynamically updating the state depending on whether there is a face detected in frame
        if(faces.length === 1) {
        //Only working with 1 face at a time
            this.setState({ faceDetected: true });
            this.setState({ faceData: faces });

            //Check whether their eyes are open
            if(faces[0].leftEyeOpenProbability > 75/100 && faces[0].rightEyeOpenProbability > 60/100) {
                this.setState({ eyesOpen: true });
                //execute code for countdown timer

            } else {
                this.setState({ eyesOpen: false });
            }

            /*
            //this was for fun / experimenting
            //console.log(faces[0].smilingProbability);
            if(faces[0].smilingProbability > 60/100) {
                this.setState({ smiling: true });
            } else {
                this.setState({ smiling: false });
            }
            */

        } else {
            this.setState({ faceDetected: false });
            this.setState({ eyesOpen: true }); //if no faces are detected, there's nobody to open their eyes
            this.setState({ faceData: [] })
            //this.setState({ smiling: false });
        } 
        //TODO: handle exception where there are multiple faces detected
        //maybe force the user to only include only one person(face) in frame
    }


    faceSquare() {
        //console.log(this.state.faceData.length);
        if(this.state.faceData.length > 0) {
            const square = {
                position: 'absolute',
                //position of the top left corner of a square - from the api
                top: this.state.faceData[0].bounds.origin.y,
                left: this.state.faceData[0].bounds.origin.x,
            };

            const style = {
                width: this.state.faceData[0].bounds.size.width,
                height: this.state.faceData[0].bounds.size.height,
                borderWidth: 2,
                borderColor: '#000000'
            };

            const textColor = {
                color: '#ffffff'
            };

            return (
                <>
                <View style = {square}>
                    <View style = {style}></View>
                </View>
                </>
            )
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

                    <View>
                        { this.faceSquare .call(this) }
                        </View>
                    <TouchableOpacity>

                    </TouchableOpacity>
                    </View>
                </Camera>
                {this.state.faceDetected
                ? <Text></Text>
                : <Text>No face detected.</Text>}
                
                {this.state.eyesOpen
                ? <Text></Text>
                : <Text>Please open your eyes.</Text>}
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
    },
    buttonContainer: {

    },
    button: {

    }
  });

export default Uploader;