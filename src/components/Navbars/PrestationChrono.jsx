import React, { useEffect, useRef, useState } from 'react';
import {
    Button,
    ButtonGroup,
    Col,
    Container,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Label,
    Row,
    Spinner
} from 'reactstrap';
import Chrono from './chrono';
import { createPrestation, getPrestationDefault } from '../../services/PresationService';
import PrestationSummary from '../../model/prestation/PrestationSummary';
import { getTimesheetTypes, getVats } from '../../services/SearchService';
import ItemDTO from '../../model/ItemDTO';
import { useAuth0 } from '@auth0/auth0-react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async/dist/react-select.esm';
import { getAffairesByVcUserIdAndSearchCriteria } from '../../services/DossierService';
import NotificationAlert from 'react-notification-alert';

const map = require( 'lodash/map' );

/**
 * React Chronometer
 */
const isNil = require( 'lodash/isNil' );
export default function PrestationChrono( props ) {
    const notificationAlert = useRef( null );
    const { label, currency, history } = props;
    const { getAccessTokenSilently } = useAuth0();
    const [prestation, setPrestation] = useState( new PrestationSummary() );
    const [timesheetType, setTimesheetType] = useState( [] );
    const [vat, setVat] = useState( [] );
    const [loadingSave, setLoadingSave] = useState( false );

    //var diff = this.state.diff;
    //var seconds = diff ? this.state.diff.getSeconds() : 0;
    //var minutes = diff ? this.state.diff.getMinutes() : 0;

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            let result;
            result = await getPrestationDefault( accessToken );
            let data;
            if ( !result.error && !isNil( result.data ) ) {
                data = new PrestationSummary( result.data );

                data.forfait = false;

                let resultTimesheet = await getTimesheetTypes( accessToken );
                let timesheetT = map( resultTimesheet.data, data => {

                    if ( prestation.tsType === data.value ) {
                        prestation.tsTypeItem = new ItemDTO( data );
                    }
                    return new ItemDTO( data );
                } );
                setTimesheetType( timesheetT );
                let resultVat = await getVats( accessToken );
                let vats = map( resultVat.data, data => {

                    if ( prestation.vat === data.value ) {
                        prestation.vatItem = new ItemDTO( data );
                    }
                    return new ItemDTO( data );
                } );
                setVat( vats );

                setPrestation( data );
            } else {

                props.history.push( `/auth/unauthorized/` );
            }

        })();
    }, [getAccessTokenSilently] );

    const addPrestation = ( seconds, minutes, hours ) => {
        if ( seconds <= 59 ) {
            minutes++;
        }
        setPrestation( { ...prestation, dh: hours, dm: minutes } );

    };

    const _loadDossierOptions = async ( inputValue, callback ) => {
        const accessToken = await getAccessTokenSilently();
        let result = await getAffairesByVcUserIdAndSearchCriteria( accessToken, inputValue );

        if ( !isNil( result ) ) {
            if ( !isNil( result.data ) ) {

                callback(
                    map( result.data, dossier => {
                        return new ItemDTO( dossier );
                    } ) );

            } else if ( result.error ) {
                // no data
            }
        }
    };

    const _handleDossierChange = ( newValue ) => {
        //const inputValue = newValue.replace( /\W/g, '' );

        setPrestation( { ...prestation, dossierId: newValue.value, dossierItem: newValue } );

        //return inputValue;
    };
    const _savePrestation = async () => {
        setLoadingSave( true );
        const accessToken = await getAccessTokenSilently();

        if ( (isNil( prestation.dh ) || prestation.dh === 0)
            && (isNil( prestation.dm ) || prestation.dm === 0) ) {
            setLoadingSave( false );
            props._savePrestationmessage( label.wizardFrais.error4, 'danger' );
            return;
        }
        if ( isNil( prestation.tsType ) ) {
            setLoadingSave( false );
            props._savePrestationmessage( label.wizardFrais.error5, 'danger' );
            return;
        }

        if ( isNil( prestation.dossierId ) ) {
            setLoadingSave( false );
            props._savePrestationmessage( label.wizardFrais.error6, 'danger' );
            return;
        }

        let result = await createPrestation( accessToken, prestation );

        if ( !result.error ) {
            props._savePrestationmessage( label.wizardFrais.success1, 'primary' );

        } else {
            props._savePrestationmessage( label.common.error1, 'danger' );
        }
        setLoadingSave( false );

    };

    return (
        <Container>

            <div className="rna-container">
                <NotificationAlert ref={notificationAlert}/>
            </div>
            <Row>
                <Chrono
                    addPrestation={addPrestation}
                    location={history.location}
                >
                </Chrono>
            </Row>
            <Row>
                <Col md="12">
                    <Label>{label.wizardFrais.label7}</Label>
                    <FormGroup>
                        <Select
                            className="react-select info"
                            classNamePrefix="react-select"
                            name="singleSelect"
                            value={prestation.tsTypeItem}
                            onChange={value => setPrestation( {
                                ...prestation,
                                tsType: value.value,
                                tsTypeItem: new ItemDTO( value )
                            } )
                            }
                            options={timesheetType}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col md="12">
                    <Label>{label.wizardFrais.label9}</Label>
                    <FormGroup>
                        <Select
                            className="react-select info"
                            classNamePrefix="react-select"
                            name="singleSelect"
                            value={prestation.vatItem}
                            onChange={value => setPrestation( {
                                ...prestation,
                                vat: value.value,
                                vatItem: new ItemDTO( value )
                            } )
                            }
                            options={vat}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col md="12">
                    <Label>{label.wizardFrais.label16}</Label>
                    <InputGroup>
                        <InputGroupAddon addonType="prepend">
                            <InputGroupText><span
                                className="currency-input-text">{currency}</span></InputGroupText>
                        </InputGroupAddon>
                        <Input step=".01"
                               value={prestation.couthoraire}
                               type="number"
                               onChange={event => {
                                   setPrestation( { ...prestation, couthoraire: event.target.value } );
                               }}
                               id="inputCosthour"
                               placeholder={label.wizardFrais.label16}
                        />
                    </InputGroup>
                </Col>
            </Row>
            <Row>
                <Col md="12">
                    <Label>{props.label.compta.file}</Label>
                    <FormGroup>
                        <Col md="12">

                            <AsyncSelect
                                value={prestation.dossierItem}
                                className="react-select info"
                                classNamePrefix="react-select"
                                cacheOptions
                                loadOptions={_loadDossierOptions}
                                defaultOptions
                                onChange={_handleDossierChange}
                                placeholder="numero dossier ou annee"
                            />
                        </Col>
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col md="10">
                    <Label>{label.wizardFrais.label18}</Label>
                    <FormGroup>
                        <Input type="textarea"
                               value={prestation.comment}
                               onChange={e => setPrestation(
                                   { ...prestation, comment: e.target.value } )}
                               placeholder={label.wizardFrais.label18}
                        />
                    </FormGroup>
                </Col>
            </Row>

            <Row>
                <Col md={{ size: 10 }} sm={{ size: 10 }}>
                    <ButtonGroup>
                        <Button color="primary" type="button" size="lg" disabled={loadingSave}
                                onClick={_savePrestation}
                        >
                            {loadingSave ? (
                                <Spinner
                                    size="sm"
                                    color="secondary"
                                />
                            ) : null}
                            {' '}{label.common.save}
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>
        </Container>
    );

}
