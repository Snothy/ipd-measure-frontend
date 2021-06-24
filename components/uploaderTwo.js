import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import { status, json } from '../utilities/requestHandlers';
import { BarCodeScanner } from 'expo-barcode-scanner';


class UploaderTwo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasPermission: null,    //whether the application has permission to access the device's camera
            type: null,             //which camera is currently in use
            faceData: [],           //The data about the face collected from the Google Mobile Vision framework
            faceDetected: false,    //whether a face is detected in frame
            eyesOpen: true,         //whether the subject's eyes are open (they need to be)
            ready: false, //red-#FF0000  green-#00FF00
            countdownInitiated: false,
            countdownTime: 3,       //2 seconds before a picture is taken
            photoTaken: false,
            photoTakingProcess: false,
            photo: null,
            barcodeScanned: false,
            barcodeData: [],
            responseReceived: false,
            response: []



        }
        this.handleFacesDetected = this.handleFacesDetected.bind(this); //the handler needs access to state
        this.startCountdown = this.startCountdown.bind(this);
        this.handleCountdown = this.handleCountdown.bind(this);
        this.cancelCountdown = this.cancelCountdown.bind(this);
        this.takePicture = this.takePicture.bind(this);
        this.handleUploadPicture = this.handleUploadPicture.bind(this);
        this.handleBarcodeScanned = this.handleBarcodeScanned.bind(this);
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
        if(faces.length === 1 && this.state.photoTakingProcess === false) {
        //Only working with 1 face at a time
            this.setState({ faceDetected: true });
            this.setState({ faceData: faces });

            //Check whether their eyes are open
            if(faces[0].leftEyeOpenProbability > 75/100 && faces[0].rightEyeOpenProbability > 60/100) {
                this.setState({ eyesOpen: true });

                //TODO: check for barcode within certain area


                //execute code for countdown timer
                if( !(this.state.countdownInitiated || this.state.photoTaken || (!this.state.barcodeScanned)) ) { 
                //if theyre all false => we start the countdown
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
            //this.setState({ faceData: [] });
            this.setState({ ready: false });
            this.setState({ barcodeScanned: false })
        } 
        //TODO: handle exception where there are multiple faces detected
        //maybe force the user to only include only one person(face) in frame
    }


    handleBarcodeScanned({ type, data }) {
        console.log(data);
        this.setState({ barcodeScanned: true, barcodeData: data })
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
            this.setState({ photoTakingProcess: true })
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
        const facedata = this.state.faceData[0];

        let localUri = data.uri;
        let filename = localUri.split('/').pop();

        let formData = new FormData();
        //making a multipart post request
        formData.append('photo', {uri:localUri, name: filename, type: "image/jpg"}); //image file 
        //console.log(formData);
        fetch("http://localhost:3000/api/methods/methodTwo", {
            method: "POST",
            body: formData,
        })
        .then(status)
        .then(json)
        .then(response => {
            this.setState( {responseReceived: true, response: response} );
            //console.log(this.state.response);
            
            
        })
        .catch(err => {
            console.log(err);
        })
    }



    barCodeSquare() {
        const square = {
            position: 'absolute',
            top: 50,
            left: 80,
        };
        let squareColour;
        if(this.state.barcodeScanned && this.state.faceDetected) {
            squareColour = '#00FF00'; //green
        } else {
            squareColour = '#FF0000'; //red
        }
        const style = {
            width: 150,
            height: 80,
            borderWidth: 2,
            borderColor: squareColour
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

        if(this.state.responseReceived) {
            return (
                <View>
                <Text>Your estimated IPD is: {this.state.response.IPD}</Text>
                </View>
            )
        }
        //{this.state.response.IPD}
        return (
            <>
                <Camera style={styles.camera} type={this.state.type}
                ref={ref => {
                    this.camera = ref;}}
                onFacesDetected={this.handleFacesDetected}
                onBarCodeScanned={this.handleBarcodeScanned}
                faceDetectorSettings={{
                    mode: FaceDetector.Constants.Mode.accurate,
                    detectLandmarks: FaceDetector.Constants.Landmarks.all,
                    runClassifications: FaceDetector.Constants.Classifications.all,
                    minDetectionInterval: 100,
                    tracking: true

                }}
                barCodeScannerSettings={{
                    barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],  //remove to test with code128 or other barcodes
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
                        { this.barCodeSquare .call(this) }
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

                        {this.state.barcodeScanned
                        ? <Text ></Text>
                        : <Text style={styles.warningText}>Place QR code on forehead</Text>}
                        
                        {this.state.eyesOpen
                        ? <Text></Text>
                        : <Text style={styles.warningText}>Please open your eyes</Text>}
                        
                    </View>






                    </View>
                </Camera>

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

export default UploaderTwo;