import React, { useEffect, useRef, useState } from 'react';
// react plugin used to create a form with multiple steps
import ReactWizard from 'react-bootstrap-wizard';

// reactstrap components
import { Col } from 'reactstrap';

// wizard steps
import Step1 from './SignupWizardSteps/Step1';
import { validateUser } from '../../services/UserServices';
import { useAuth0 } from '@auth0/auth0-react';
import ProfileDTO from '../../model/user/ProfileDTO';
import CircularProgress from '@material-ui/core/CircularProgress';
import NotificationAlert from 'react-notification-alert';
import { getOptionNotification } from '../../utils/AlertUtils';
import { getLawfirmByName } from '../../services/LawfirmsService';
import Step2 from './SignupWizardSteps/Step2';
import DefaultLawfirmDTO from '../../model/DefaultLawfirmDTO';
import { validateEmail } from '../../utils/Utils';

const isNil = require( 'lodash/isNil' );

export const Wizard = ( { user, label, history } ) => {
    const { getAccessTokenSilently } = useAuth0();
    const notificationAlert = useRef( null );
    const originalVcKey = useRef( null );

    const [loading, setLoading] = useState( false );
    const [countryCode, setCountryCode] = useState( 'BE' );
    const [btnFinishClass, setBtnFinishClass] = useState( 'btn-wd btn-info' );
    const [vckeySelected, setVckeySelected] = useState( null );
    const [vckeyNameState, setVckeyNameState] = useState( 'has-success' );

    // force to set the vckey value
    useEffect( () => {
        originalVcKey.current = !isNil( user ) ? user.vcKeySelected : null;
        setVckeySelected( !isNil( user ) ? user.vcKeySelected : null );
    }, [user] );
    const _changeCountry = ( code ) => {
        setCountryCode( code );
    };
    const _changeVcKey = ( value ) => {
        setVckeySelected( value );
    };
    const steps = [
        {
            stepName: 'vc',
            stepIcon: 'tim-icons icon-single-02',
            stepProps: {
                label: label.wizardSignup,
                originalVcKey: originalVcKey.current,
                vckeySelected: vckeySelected,
                vckeyNameState: vckeyNameState,
                changeVcKey: _changeVcKey
            },
            component: Step1
        },
        {
            stepName: 'info',
            stepIcon: 'tim-icons icon-bulb-63',
            stepProps: {
                label: label,
                vckeySelected: vckeySelected,
                originalVcKey: originalVcKey.current,
                email: user ? user.email : '',
                countryCodeProps: countryCode,
                changeCountry: _changeCountry,

            },
            component: Step2
        }
    ];

    const finishButtonClick = async ( allStates ) => {
        setLoading( true );
        setBtnFinishClass( 'btn-wd btn-info disabled' );
        if ( allStates.vc.vckeyNameState === 'has-success' ) {
            const newVcName = allStates.vc.vckeyName;
            // verify lawfirm
            const accessToken = await getAccessTokenSilently( { ignoreCache: true } );

            // must be different than the initial
            if ( newVcName !== vckeySelected ) {

                // check if it exists
                const resultLawfirm = await getLawfirmByName( accessToken, newVcName );
                if ( !resultLawfirm.error && resultLawfirm.data && resultLawfirm.data !== '' ) {
                    setVckeyNameState( 'has-danger' );
                    notificationAlert.current.notificationAlert( getOptionNotification( label.wizardSignup.error2, 'danger' ) );
                    setBtnFinishClass( 'btn-wd btn-info' );
                    setLoading( false );
                    return;
                }
            }

            if ( allStates.info.virtualCab.email && !validateEmail( allStates.info.virtualCab.email ) ) {
                notificationAlert.current.notificationAlert( getOptionNotification( label.affaire.error18, 'danger' ) );
                return;
            }

            const defaultLawfirmDTO = new DefaultLawfirmDTO();
            defaultLawfirmDTO.vcKey = newVcName;
            defaultLawfirmDTO.language = user.language;
            defaultLawfirmDTO.lawfirmDTO = allStates.info.virtualCab;
            defaultLawfirmDTO.itemVatDTOList = [];

            const result = await validateUser( accessToken, defaultLawfirmDTO );
            if ( result.error ) {
                setVckeyNameState( 'has-danger' );
                notificationAlert.current.notificationAlert( getOptionNotification( label.wizardSignup.error1, 'danger' ) );
                setBtnFinishClass( 'btn-wd btn-info' );
                setLoading( false );
                return;
            }
            const profileDto = new ProfileDTO( result.data );
            if ( !isNil( profileDto ) && profileDto.temporaryVc === false ) {
                history.push( '/' );
            }

            return true;
        } else {
            if ( vckeyNameState !== 'has-success' ) {
                setVckeyNameState( 'has-danger' );
            }
            setBtnFinishClass( 'btn-wd btn-info' );

            setLoading( false );
            return false;
        }

    };

    return (
        <>
            <div className="content">
                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert}/>
                </div>
                <Col className="mr-auto ml-auto" md="10">
                    {isNil( vckeySelected ) ? (
                        <CircularProgress size={50}/>
                    ) : (
                        <>
                            {loading ? (
                                <CircularProgress size={50}/>
                            ) : null}
                            <ReactWizard
                                steps={steps}
                                navSteps
                                validate
                                title={label.wizardSignup.title}
                                description={label.wizardSignup.description}
                                headerTextCenter
                                nextButtonText={label.common.next}
                                previousButtonText={label.common.preview}
                                finishButtonClasses={btnFinishClass}
                                nextButtonClasses="btn-wd btn-info"
                                previousButtonClasses="btn-wd"
                                progressbar
                                color="blue"
                                finishButtonClick={finishButtonClick}
                            />
                        </>
                    )}
                </Col>
            </div>
        </>
    );
};

export default Wizard;
