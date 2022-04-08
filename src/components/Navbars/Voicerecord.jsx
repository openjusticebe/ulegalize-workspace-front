import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, CardSubtitle, Col, FormText, Input, Row } from 'reactstrap';
import createSpeechServicesPonyfill from 'web-speech-cognitive-services';

import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import AppointmentModalPanel from '../Calendar/AppointmentModalPanel';
import { useAuth0 } from '@auth0/auth0-react';
import { getCalendarEventType, getUserResponsableList } from '../../services/SearchService';
import ItemDTO from '../../model/ItemDTO';
import ItemEventDTO from '../../model/agenda/ItemEventDTO';
import { checkPaymentActivated } from '../../services/PaymentServices';
import ReactLoading from 'react-loading';
import { newEvent } from '../../utils/CalendarUtils';
import LawfirmCalendarEventDTO from '../../model/agenda/LawfirmCalendarEventDTO';
import CloudUpload from '@material-ui/icons/CloudUpload';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import { withStyles } from '@material-ui/core/styles';
import { getRecordingPrice, getRecordingSpeechPrice } from '../../services/transparency/PriceServices';
import Switch from 'react-bootstrap-switch';
import ReactBSAlert from 'react-bootstrap-sweetalert';
import { createEvent, updateEvent } from '../../services/AgendaService';
import { getRecognitionToken } from '../../services/RecordServices';
import { uploadFile } from '../../services/DriveService';

const speechsdk = require( 'microsoft-cognitiveservices-speech-sdk' );
const Ciseaux = require( 'ciseaux/browser' );
var lamejs = require( 'lamejs' );
const toWav = require( 'audiobuffer-to-wav' );

let moment = require( 'moment-timezone' );

moment.tz.setDefault( 'Europe/Brussels' );

const REGION = 'francecentral';
const map = require( 'lodash/map' );
const isNil = require( 'lodash/isNil' );
const filter = require( 'lodash/filter' );
const isEmpty = require( 'lodash/isEmpty' );
const styles = theme => ({
    rightIcon: {
        marginLeft: theme.spacing.unit,
    },
});

function Voicerecord( {
                          showMessage,
                          vckeySelected,
                          history,
                          userId,
                          currency,
                          fullName,
                          label,
                          isCreated,
                          language,
                          toggleRecord,
                          toggleUnPaid,
                          classes,
                          selectedEventProps
                      } ) {
    const [pricing, setPricing] = useState( null );
    const [pricingSpeechToText, setPricingSpeechToText] = useState( null );
    const [isLoading, setIsLoading] = useState( false );
    const [loadingText, setLoadingText] = useState( false );
    const [displayMicroText, setDisplaMicroText] = useState( selectedEventProps && selectedEventProps.microText ? selectedEventProps.microText : '' );
    const [displayText, setDisplayText] = useState( selectedEventProps && selectedEventProps.audioText ? selectedEventProps.audioText : '' );
    const [fileBuffer, setFileBuffer] = useState( null );
    const recording = useRef( false );
    const { getAccessTokenSilently } = useAuth0();
    const [userResponsableList, setUserResponsableList] = useState( [] );
    const [calendarTypeList, setCalendarTypeList] = useState( [] );
    const [payment, setPayment] = useState( false );
    const [selectedEventState, setselectedEventState] = useState( new LawfirmCalendarEventDTO( selectedEventProps ) );
    const [activatedAlert, setActivatedAlert] = useState( null );
    const tokenResponseAuth = useRef( null );
    const hiddenFileInput = useRef( null );
    const lastTime = useRef( 0 );
    // time for the micro
    const startMicroSelect = useRef( -1 );
    const endMicroSelect = useRef( -1 );
    // time for the audio
    const startSelect = useRef( -1 );
    const endSelect = useRef( -1 );

    const {
        listening,
        transcript,
        finalTranscript,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();
    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            const resultToken = await getRecognitionToken(accessToken);

            if(!isNil(resultToken.data) && !isEmpty(resultToken.data)) {
                tokenResponseAuth.current = resultToken.data;

                const { SpeechRecognition: AzureSpeechRecognition } = createSpeechServicesPonyfill( {
                    credentials: {
                        region: REGION,
                        authorizationToken: resultToken.data,
                    }
                } );
                SpeechRecognition.applyPolyfill( AzureSpeechRecognition );

                let resultUser = await getUserResponsableList( accessToken, vckeySelected );
                let profiles = map( resultUser.data, data => {
                    return new ItemDTO( data );
                } );
                // add vc key 0 , vckey
                profiles.push( new ItemDTO( { value: 0, label: vckeySelected } ) );
                setUserResponsableList( profiles );

                let resultType = await getCalendarEventType( accessToken );
                let calendarTypeListTemp;
                if ( resultType.data ) {
                    calendarTypeListTemp = filter( resultType.data, type => {
                        if ( type.value === 'RECORD' ) {
                            return new ItemEventDTO( type );
                        }
                    } );
                    setCalendarTypeList( calendarTypeListTemp );
                }

                if ( isNil( selectedEventProps ) ) {
                    const now = moment();
                    // nearest 30 minutes to the start date
                    const remainder = 30 - (now.minute() % 30);
                    const start = now.add( remainder, 'minutes' );

                    let newEv = newEvent( new LawfirmCalendarEventDTO(), start.toDate(), start.add( 30, 'minutes' ).toDate(), userId, calendarTypeListTemp, profiles, null );
                    setselectedEventState( newEv );
                }

                let resultPayment = await checkPaymentActivated( accessToken );
                if ( !isNil( resultPayment ) ) {
                    setPayment( resultPayment.data );
                    if ( resultPayment.data === false ) {
                        toggleUnPaid();
                        toggleRecord();
                    } else {
                        let resultRecord = await getRecordingPrice( accessToken );
                        if ( !isNil( resultRecord ) ) {
                            setPricing( resultRecord.data );
                        }
                        let resultRecordSpeech = await getRecordingSpeechPrice( accessToken );
                        if ( !isNil( resultRecordSpeech ) && !isNil( resultRecordSpeech.data ) ) {
                            setPricingSpeechToText( resultRecordSpeech.data );
                        }
                    }
                }
            }
        })();
    }, [getAccessTokenSilently] );
    const _handleFileUploadAlert = event => {
        setActivatedAlert( <ReactBSAlert
            warning
            style={{ display: 'block', marginTop: '100px' }}
            title={label.common.label17}
            onConfirm={() => {
                hiddenFileInput.current.click();
                setActivatedAlert( null );
            }}
            onCancel={() => { setActivatedAlert( null ); }}
            confirmBtnBsStyle="success"
            cancelBtnBsStyle="danger"
            confirmBtnText={label.common.label2}
            cancelBtnText={label.common.cancel}
            showCancel
            btnSize=""
        >
            {label.common.label18} {pricing.toFixed( 2 )} € {label.common.htva}
        </ReactBSAlert> );
    };

    if ( !browserSupportsSpeechRecognition ) {
        return <span>Browser doesn't support speech recognition.</span>;
    }

    const _triggerRecord = async () => {
        recording.current = !recording.current;

        if ( listening ) {
            SpeechRecognition.abortListening();
        } else {
            await SpeechRecognition.startListening( {
                continuous: true,
                language: 'fr-FR'
            } );
        }
        const recognition = SpeechRecognition.getRecognition();
        const onResult = recognition.onresult;
        recognition.onresult = ( e ) => {
            const tmp = e.results[ 0 ][ 0 ].transcript;

            if ( startMicroSelect.current !== -1 && endMicroSelect.current !== -1 ) {
                let beginDisplayText = displayMicroText.substr( 0, startMicroSelect.current );
                let endDisplayText = displayMicroText.substr( startMicroSelect.current, endMicroSelect.current );
                let valueFinal = beginDisplayText + ' ' + tmp + ' ' + endDisplayText;

                setselectedEventState( { ...selectedEventState, microText: valueFinal } );
                setDisplaMicroText( valueFinal );
            } else {
                setselectedEventState( { ...selectedEventState, microText: displayMicroText + ' ' + tmp } );
                setDisplaMicroText( displayMicroText + ' ' + tmp );
            }
        };

    };
    // this function is to open the Search modal
    const _url = ( speechBlob ) => {
        const reader = new FileReader();
        reader.readAsDataURL( speechBlob );

        reader.onloadend = () => {
            //setFileBuffer( reader.result );

            Ciseaux.context = new AudioContext();

            Ciseaux.from( reader.result ).then( function ( tape ) {
                // render the tape to an AudioBuffer
                return tape.render();
            } ).then( async ( audioBuffer ) => {
                let mp3 = audioBufferToWav( audioBuffer );

                setFileBuffer( mp3 );
            } );
        };
    };

    const _uploadFile = async ( event ) => {
        const audioFile = event.target.files[ 0 ];

        let eventTmp = selectedEventState;
        eventTmp.pathFile = audioFile.name;

        let formData = new FormData();
        formData.append( 'files', audioFile );
        formData.append('path', `tmp/`);
        const accessToken = await getAccessTokenSilently();

        uploadFile(accessToken, formData);

        // upload the file

        _saveEvent(eventTmp);

        setselectedEventState( eventTmp );
        _url( audioFile );

    };

    const fileRecognitionChange = async ( event ) => {
        setLoadingText( true );

        let audio = event.target;

        Ciseaux.context = new AudioContext();

        Ciseaux.from( fileBuffer ).then( function ( tape ) {
            // edit tape
            // last time = last play
            // audio current is the time where I pause
            tape = Ciseaux.concat( [tape.slice( lastTime.current, audio.currentTime )] );

            // render the tape to an AudioBuffer
            return tape.render();
        } ).then( async ( audioBuffer ) => {

            let wav = toWav( audioBuffer );
            var audioFile = new File( [new DataView( wav )], 'tmp.wav', {
                type: 'audio/wav'
            } );
            const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken( tokenResponseAuth.current, REGION );
            speechConfig.speechRecognitionLanguage = 'fr-FR';

            const audioConfig = speechsdk.AudioConfig.fromWavFileInput( audioFile );
            const recognizer = new speechsdk.SpeechRecognizer( speechConfig, audioConfig );

            recognizer.recognizeOnceAsync( result => {
                let displayTextTmp;
                if ( result.reason === ResultReason.RecognizedSpeech ) {
                    displayTextTmp = `${result.text}`;
                } else {
                    displayTextTmp = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
                }
                lastTime.current = audio.currentTime;

                if ( startSelect.current !== -1 && endSelect.current !== -1 ) {
                    let beginDisplayText = displayText.substr( 0, startSelect.current );
                    let endDisplayText = displayText.substr( startSelect.current, endSelect.current );
                    let valueFinal = beginDisplayText + ' ' + displayTextTmp + ' ' + endDisplayText;

                    setselectedEventState( { ...selectedEventState, audioText: valueFinal } );
                    setDisplayText( valueFinal );
                } else {
                    setselectedEventState( { ...selectedEventState, audioText: displayText + ' ' + displayTextTmp } );
                    setDisplayText( displayText + ' ' + displayTextTmp );
                }
                setLoadingText( false );
            } );
        } );

    };

    const toggleAppointment = async () => {
        toggleRecord();
    };

    const _showMessageFromPopup = ( message, type ) => {
        showMessage( message, type );
    };
    const _acceptToggleSpeechToText = () => {

        let eventTmp = selectedEventState;
        eventTmp.speechToTextActivated = !selectedEventState.speechToTextActivated;

        _saveEvent(eventTmp);

        setselectedEventState( eventTmp );

        setActivatedAlert( null );
    };
    const _saveEvent = async ( selectedEvent ) => {
        if ( isNil( selectedEvent.start ) ) {
            _showMessageFromPopup( label.agenda.error1, 'danger' );
            setIsLoading( false );

            return;
        }

        if ( selectedEvent.eventType !== 'TASK' ) {
            if ( isNil( selectedEvent.end ) ) {
                _showMessageFromPopup( label.agenda.error4, 'danger' );
                setIsLoading( false );

                return;
            }
            if ( moment( selectedEvent.end ).isBefore( selectedEvent.start ) ) {
                _showMessageFromPopup( label.agenda.error3, 'danger' );
                setIsLoading( false );

                return;
            }
        }
        // if UPDATE
        if ( !isNil( selectedEvent.id ) ) {
            const accessToken = await getAccessTokenSilently();

            // save without approval
            const result = await updateEvent( accessToken, selectedEvent.id, selectedEvent );

            if ( !result.error ) {
                _showMessageFromPopup( label.agenda.success2, 'success', true );

                setselectedEventState(result.data);
            } else {
                _showMessageFromPopup( label.agenda.error8, 'danger' );
            }

        } else {
            const accessToken = await getAccessTokenSilently();

            const result = await createEvent( accessToken, selectedEvent );

            if ( !result.error ) {
                _showMessageFromPopup( label.agenda.success1, 'success', true );
                setselectedEventState(result.data);
            } else {
                _showMessageFromPopup( label.agenda.error9, 'danger' );
            }
        }
    };

    return (
        <>
            {payment === true ? (
                <>
                    {activatedAlert}
                    <Alert color="primary">
                        {!isNil( pricing ) ? (
                                <>
                                    {label.record.label4}<b>{pricing.toFixed( 2 )} € {label.common.htva}</b>.
                                    <br/>
                                    <>{label.record.label6}
                                        {!isNil( pricingSpeechToText ) ? (
                                            <b>{pricingSpeechToText.toFixed( 2 )} € {label.common.htva}</b>
                                        ) : null}
                                    </>
                                    <br/>
                                    <>
                                        {label.record.label5}
                                    </>
                                    <br/>
                                    <>
                                        {label.record.label8}
                                    </>
                                </>
                            ) :
                            (
                                <ReactLoading className="loading" height={'5%'} width={'5%'}/>
                            )}
                    </Alert>
                    <Row>
                        <Col md="10">
                            <CardSubtitle>{label.record.label1}</CardSubtitle>
                            <Switch
                                value={selectedEventState.speechToTextActivated}
                                defaultValue={selectedEventState.speechToTextActivated}
                                disabled={selectedEventState.speechToTextActivated === true}
                                offColor="primary"
                                onText={label.record.label2}
                                onColor="primary"
                                offText={label.record.label3}
                                onChange={value => {
                                    if ( selectedEventState.speechToTextActivated === false ) {
                                        setActivatedAlert( <ReactBSAlert
                                            warning
                                            style={{ display: 'block', marginTop: '100px' }}
                                            title={label.common.label15}
                                            onConfirm={() => {
                                                _acceptToggleSpeechToText();
                                            }}
                                            onCancel={() => { setActivatedAlert( null ); }}
                                            confirmBtnBsStyle="success"
                                            cancelBtnBsStyle="danger"
                                            confirmBtnText={label.common.label2}
                                            cancelBtnText={label.common.cancel}
                                            showCancel
                                            btnSize=""
                                        >
                                            {label.common.label16} {pricingSpeechToText.toFixed( 2 )} € {label.common.htva}
                                        </ReactBSAlert> );
                                    }
                                }
                                }
                            />{' '}
                        </Col>
                    </Row>
                    <Card>
                        {/* activate the micro */}
                        {selectedEventState.speechToTextActivated === true ? (
                            <>
                                <Button
                                    className={listening ? 'Rec' : null}
                                    onClick={_triggerRecord}>
                                    {listening ? label.record.stop : label.record.start}
                                </Button>

                                <div className="is-loading">
                                    <Input
                                        type="textarea"
                                        name="audioDisplay"
                                        rows={3}
                                        className="form-control"
                                        placeholder="Play the video"
                                        value={displayMicroText}
                                        onKeyDown={( e ) => {
                                            startMicroSelect.current = e.target.selectionStart;
                                            endMicroSelect.current = e.target.selectionEnd;
                                        }}
                                        onChange={( e ) => {
                                            startMicroSelect.current = e.target.selectionStart;
                                            endMicroSelect.current = e.target.selectionEnd;

                                            if ( isEmpty( displayMicroText ) ) {
                                                let beginDisplayText = displayMicroText.substr( 0, startMicroSelect.current );
                                                let endDisplayText = displayMicroText.substr( startMicroSelect.current, endMicroSelect.current );
                                                let valueFinal = beginDisplayText + ' ' + transcript + ' ' + endDisplayText;

                                                setselectedEventState( {
                                                    ...selectedEventState,
                                                    microText: valueFinal
                                                } );
                                                setDisplaMicroText( valueFinal );
                                            } else {
                                                setselectedEventState( {
                                                    ...selectedEventState,
                                                    microText: e.target.value
                                                } );
                                                setDisplaMicroText( e.target.value );
                                            }

                                        }}
                                    />
                                    {loadingText === true ? (
                                        <div className="spinner-border spinner-border-sm"/>
                                    ) : null}
                                </div>
                            </>

                        ) : null}
                    </Card>
                    <Button
                        onClick={_handleFileUploadAlert}
                    >
                        {'Upload'}
                        <CloudUpload className={classes.rightIcon}/>
                        <input
                            accept={`audio/mp3,audio/wav`}
                            ref={hiddenFileInput}
                            type="file"
                            id="audio-file"
                            onChange={( e ) => _uploadFile( e )}
                            style={{ display: 'none' }}
                        />

                    </Button>
                    <FormText>
                        {label.record.label7}
                    </FormText>
                    {fileBuffer ? (
                        <>
                            {selectedEventState.speechToTextActivated === true ? (
                                <AudioPlayer
                                    autoPlay={false}
                                    showSkipControls={false}
                                    src={fileBuffer}
                                    onPause={e => {
                                        fileRecognitionChange( e );
                                    }}
                                    onPlay={e => {
                                        lastTime.current = e.target.currentTime;
                                    }}
                                    // other props here
                                />
                            ) : (
                                <AudioPlayer
                                    autoPlay={false}
                                    showSkipControls={false}
                                    src={fileBuffer}
                                />
                            )}

                            <div className="is-loading">
                                <Input
                                    type="textarea"
                                    name="audioDisplay"
                                    rows={3}
                                    className="form-control"
                                    placeholder="Play the video"
                                    value={displayText}
                                    onKeyDown={( e ) => {
                                        startSelect.current = e.target.selectionStart;
                                        endSelect.current = e.target.selectionEnd;
                                    }}
                                    onChange={( e ) => {
                                        startSelect.current = e.target.selectionStart;
                                        endSelect.current = e.target.selectionEnd;
                                        setselectedEventState( { ...selectedEventState, audioText: e.target.value } );
                                        setDisplayText( e.target.value );
                                    }}
                                />
                                {loadingText === true ? (
                                    <div className="spinner-border spinner-border-sm"/>
                                ) : null}
                            </div>
                        </>
                    ) : null}

                    <AppointmentModalPanel toggleAppointment={toggleAppointment}
                                           isModal={false}
                                           saveEvent={_saveEvent}
                                           showMessageFromPopup={_showMessageFromPopup}
                                           userResponsableList={userResponsableList}
                                           label={label}
                                           userId={userId}
                                           currency={currency}
                                           fullName={fullName}
                                           dossierId={null}
                                           language={language}
                                           vckeySelected={vckeySelected}
                                           history={history}
                                           isLoadingSave={isLoading}
                                           approved={false}
                                           isCreated={isCreated}
                                           calendarTypeList={calendarTypeList}
                                           selectedEventProps={selectedEventState}/></>
            ) : (
                <ReactLoading className="loading" height={'20%'} width={'20%'}/>
            )}
        </>
    );

}

function wavToMp3( channels, sampleRate, left, right = null ) {
    var buffer = [];
    var mp3enc = new lamejs.Mp3Encoder( channels, sampleRate, 128 );
    var remaining = left.length;
    var samplesPerFrame = 1152;

    for ( var i = 0; remaining >= samplesPerFrame; i += samplesPerFrame ) {
        let mp3buf;

        if ( !right ) {
            var mono = left.subarray( i, i + samplesPerFrame );
            mp3buf = mp3enc.encodeBuffer( mono );
        } else {
            var leftChunk = left.subarray( i, i + samplesPerFrame );
            var rightChunk = right.subarray( i, i + samplesPerFrame );
            mp3buf = mp3enc.encodeBuffer( leftChunk, rightChunk );
        }
        if ( mp3buf.length > 0 ) {
            buffer.push( mp3buf );//new Int8Array(mp3buf));
        }
        remaining -= samplesPerFrame;
    }
    var d = mp3enc.flush();
    if ( d.length > 0 ) {
        buffer.push( new Int8Array( d ) );
    }

    var mp3Blob = new Blob( buffer, { type: 'audio/mp3' } );
    var bUrl = window.URL.createObjectURL( mp3Blob );

    //downloadBlob( mp3Blob, 'tmp.mp3' );
    // send the download link to the console
    console.log( 'mp3 download:', bUrl );

    return bUrl;
    //return mp3Blob;

}

function audioBufferToWav( aBuffer ) {
    let numOfChan = aBuffer.numberOfChannels,
        btwLength = aBuffer.length * numOfChan * 2 + 44,
        btwArrBuff = new ArrayBuffer( btwLength ),
        btwView = new DataView( btwArrBuff ),
        btwChnls = [],
        btwIndex,
        btwSample,
        btwOffset = 0,
        btwPos = 0;
    setUint32( 0x46464952 ); // "RIFF"
    setUint32( btwLength - 8 ); // file length - 8
    setUint32( 0x45564157 ); // "WAVE"
    setUint32( 0x20746d66 ); // "fmt " chunk
    setUint32( 16 ); // length = 16
    setUint16( 1 ); // PCM (uncompressed)
    setUint16( numOfChan );
    setUint32( aBuffer.sampleRate );
    setUint32( aBuffer.sampleRate * 2 * numOfChan ); // avg. bytes/sec
    setUint16( numOfChan * 2 ); // block-align
    setUint16( 16 ); // 16-bit
    setUint32( 0x61746164 ); // "data" - chunk
    setUint32( btwLength - btwPos - 4 ); // chunk length

    for ( btwIndex = 0; btwIndex < aBuffer.numberOfChannels; btwIndex++ ) {
        btwChnls.push( aBuffer.getChannelData( btwIndex ) );
    }

    while ( btwPos < btwLength ) {
        for ( btwIndex = 0; btwIndex < numOfChan; btwIndex++ ) {
            // interleave btwChnls
            btwSample = Math.max( -1, Math.min( 1, btwChnls[ btwIndex ][ btwOffset ] ) ); // clamp
            btwSample = (0.5 + btwSample < 0 ? btwSample * 32768 : btwSample * 32767) | 0; // scale to 16-bit signed int
            btwView.setInt16( btwPos, btwSample, true ); // write 16-bit sample
            btwPos += 2;
        }
        btwOffset++; // next source sample
    }

    let wavHdr = lamejs.WavHeader.readHeader( new DataView( btwArrBuff ) );
    let wavSamples = new Int16Array( btwArrBuff, wavHdr.dataOffset, wavHdr.dataLen / 2 );

    return wavToMp3( wavHdr.channels, wavHdr.sampleRate, wavSamples );

    function setUint16( data ) {
        btwView.setUint16( btwPos, data, true );
        btwPos += 2;
    }

    function setUint32( data ) {
        btwView.setUint32( btwPos, data, true );
        btwPos += 4;
    }
}

export default withStyles( styles )( Voicerecord );
