import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import {Button} from 'antd-mobile-rn';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import { status, json } from '../utilities/requestHandlers';
import * as FileSystem from 'expo-file-system';


class Uploader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasPermission: null,    //whether the application has permission to access the device's camera
            type: null,             //which camera is currently in use
            faceData: [],           //The data about the face collected from the Google Mobile Vision framework
            faceDetected: false,    //whether a face is detected in frame
            eyesOpen: true,         //whether the subject's eyes are open (they need to be)
            faceTooClose: false,
            faceTooFar: false,
            faceRecenter: false,
            ready: false, //red-#FF0000  green-#00FF00
            countdownInitiated: false,
            countdownTime: 3,       //2 seconds before a picture is taken
            photoTaken: false,
            photo: null



        }
        this.handleFacesDetected = this.handleFacesDetected.bind(this); //the handler needs access to state
        this.faceSquare = this.faceSquare.bind(this);
        this.startCountdown = this.startCountdown.bind(this);
        this.handleCountdown = this.handleCountdown.bind(this);
        this.cancelCountdown = this.cancelCountdown.bind(this);
        this.takePicture = this.takePicture.bind(this);
        this.handleUploadPicture = this.handleUploadPicture.bind(this);
    }

    countdownTimer = null;

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

            //Make sure they subject's face at the correct distance (they fit the square parameters)
            const currLength = faces[0].bounds.size.width; //its a square so the 2 sides are the same length
            const currY = faces[0].bounds.origin.y;        //even if the square is the same size, they might not be in the correct position of the frame
            const currX = faces[0].bounds.origin.x;
            if(currLength < styles.minStyle.width) {
                this.setState({ faceTooFar: true });
                this.setState({ ready: false });
            } else {
                this.setState({ faceTooFar: false });
            }
            if(currLength > styles.maxStyle.width ) {
                this.setState({ faceTooClose: true });
                this.setState({ ready: false });
            } else {
                this.setState({ faceTooClose: false });
            }
            if(currY > styles.minSquare.top || currX > styles.minSquare.left) {
                this.setState({ faceRecenter: true });
                this.setState({ ready: false });
            } else {
                this.setState({ faceRecenter: false })
            }

            //Check whether their eyes are open
            if(faces[0].leftEyeOpenProbability > 75/100 && faces[0].rightEyeOpenProbability > 60/100) {
                this.setState({ eyesOpen: true });
                //execute code for countdown timer
                if( !(this.state.faceTooFar || this.state.faceTooClose || this.state.faceRecenter || this.state.countdownInitiated) ) { //if theyre all false => we start the countdown
                    this.setState({ ready: true }); 
                    this.startCountdown();
                    //console.log('passed through');
                }
            } else {
                this.setState({ eyesOpen: false });
                this.setState({ ready: false });
            }

        } else {
            this.setState({ faceDetected: false });
            this.setState({ eyesOpen: true }); //if no faces are detected, there's nobody to open their eyes
            this.setState({ faceData: [] });
            this.setState({ faceTooClose: false });
            this.setState({ faceTooFar: false });
            this.setState({ faceRecenter: false });
            this.setState({ ready: false });
            //this.setState({ smiling: false });
        } 
        //TODO: handle exception where there are multiple faces detected
        //maybe force the user to only include only one person(face) in frame
    }


    startCountdown() {
        this.setState({ countdownInitiated: true });
        this.countdownTimer = setInterval(this.handleCountdown, 1000);
    }

    handleCountdown() {
        if(this.state.countdownTime > 0) {
            if(!this.state.ready) {
                return this.cancelCountdown();
            }
            let updatedTime = this.state.countdownTime - 1;
            this.setState({ countdownTime: updatedTime });
        } else {
            this.cancelCountdown();
            this.takePicture();
        }
    }

    cancelCountdown() {
        clearInterval(this.countdownTimer);
        this.setState({ countdownTime: 3, countdownInitiated: false });
    }

    async takePicture() {
        if(this.camera) {
            let photo = await this.camera.takePictureAsync();
            this.setState({ photoTaken: true, photo: photo })
            //console.log(this.state.photo.uri);
            //make post request to backend
            this.handleUploadPicture();
        }
    }




    handleUploadPicture() {
        //replace localhost with computer ip address so the mobile device can access the picture
        const data = this.state.photo;

        let localUri = data.uri;
        let filename = localUri.split('/').pop();

        let formData = new FormData();
        formData.append('photo', {uri:localUri, name: filename, type: "image/jpg"});
        console.log(formData);
        fetch("http://localhost:3000/api/methodOne", {
            method: "POST",
            body: formData,
        })
        .then(status)
        .then(json)
        .then(response => {
            console.log(response);
        })
        .catch(err => {
            console.log(err);
        })
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
            let squareColour;
            if(this.state.ready) {
                squareColour = '#00FF00'; //green
            } else {
                squareColour = '#FF0000'; //red
            }
            const style = {
                width: this.state.faceData[0].bounds.size.width,
                height: this.state.faceData[0].bounds.size.height,
                borderWidth: 2,
                borderColor: squareColour
            };

            const textColor = {
                color: '#ffffff'
            };

            //console.log(square.top, square.left, style.width, style.height); //16-25-left   | 68-75-top

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
                ref={ref => {
                    this.camera = ref;}}
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

                        <View
                        style={styles.textStyle}>
                            {this.state.ready 
                            ? <Text style={styles.countdown}>
                            {this.state.countdownTime}  
                            </Text>
                            : <Text></Text>
                            }
                        </View>


                    <View style={styles.warningTextStyle}>
                        {this.state.faceDetected
                        ? <Text ></Text>
                        : <Text style={styles.warningText}>No face detected</Text>}
                        
                        {this.state.eyesOpen
                        ? <Text></Text>
                        : <Text style={styles.warningText}>Please open your eyes</Text>}

                        {this.state.faceTooClose
                        ? <Text style={styles.warningText}>Move back</Text>
                        : <Text></Text>}

                        {this.state.faceTooFar
                        ? <Text style={styles.warningText}>Move closer</Text>
                        : <Text></Text>}

                        {this.state.faceRecenter
                        ? <Text style={styles.warningText}>Recenter</Text>
                        : <Text></Text>}

                        
                    </View>






                    </View>
                </Camera>

                <View>
                {this.state.photoTaken
                        ? <Image style={{ width: 300, height: 300 }} source={{uri:this.state.photo.uri}}></Image>
                        : <Text>aaa</Text>}
                </View>
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
    minSquare: {
        position: 'absolute',
        //position of the top left corner of a square - from the api
        top: 70,
        left: 30,
    },
    minStyle: {
        width: 240,
        height: 240,
        borderWidth: 2,
        borderColor: '#000000'
    },
    maxSquare: {
        position: 'absolute',
        //position of the top left corner of a square - from the api
        top: 50,
        left: 13,
    },
    maxStyle: {
        width: 276,
        height: 276,
        borderWidth: 2,
        borderColor: '#000000'
    },
    textStyle: {
        flex: 1,
        flexDirection: 'row',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    countdown: {
        fontSize: 40,
        color: 'white'
    },
    warningTextStyle: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    warningText: {
        fontSize: 20,
        color: 'white'
    },
    buttonContainer: {

    },
    button: {

    }
  });

export default Uploader;