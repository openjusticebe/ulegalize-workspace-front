import React, { useState } from 'react';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Modal,
    Input,
    ModalBody,
    ModalHeader,
    InputGroup,
    InputGroupAddon, InputGroupText, ModalFooter, Spinner
} from 'reactstrap';
import classnames from 'classnames';
import { createLawfirm, getLawfirmByName } from '../../../services/LawfirmsService';
import { useAuth0 } from '@auth0/auth0-react';

const toUpper = require( 'lodash/toUpper' );

export default function ModalCreateLawfirm( { openDialog, toggle, label, showMessage , refreshVckeys } ) {
    const { getAccessTokenSilently } = useAuth0();
    const [loadingSave, setLoadingSave] = useState( false );
    const [vckeyName, setVckeyName] = useState( '' );
    const [vckeyNameState, setVckeyNameState] = useState( 'has-success' );
    const [vckeyNameFocus, setVckeyNameFocus] = useState( false );

    // function that verifies if a string has a given length or not
    const _create = async (  ) => {
        if ( vckeyNameState === 'has-success' ) {

            const accessToken = await getAccessTokenSilently();
            setLoadingSave( true );

            // check if it exists
            const resultLawfirm = await getLawfirmByName( accessToken, vckeyName );
            if ( !resultLawfirm.error && resultLawfirm.data && resultLawfirm.data !== '' ) {
                setVckeyNameState( 'has-danger' );
                showMessage( label.wizardSignup.error2, 'danger' );
                setLoadingSave( false );
                return;
            }

            const result = await createLawfirm( accessToken, vckeyName, 'BE' );
            if ( result.error ) {
                setVckeyNameState( 'has-danger' );
                showMessage( label.wizardSignup.error1, 'danger' );
                setLoadingSave( false );
                return;
            } else {
                refreshVckeys();
                showMessage( label.common.success1, 'primary' );
                setLoadingSave( false );
                toggle();
            }
        }
    };
    // function that verifies if a string has a given length or not
    const verifyLength = ( value, length ) => {
        if ( value.length >= length ) {
            return true;
        }
        return false;
    };
    const change = ( event, stateName, type, stateNameEqualTo, maxValue ) => {
        switch ( type ) {
            case 'length':
                if ( verifyLength( event.target.value, stateNameEqualTo ) ) {
                    setVckeyNameState('has-success')
                } else {
                    setVckeyNameState('has-danger')
                }
                // only numbers and letters
                if ( event.target.value && /^[a-zA-Z0-9_]+$/.test( event.target.value ) ) {
                    setVckeyNameState('has-success')
                } else {
                    setVckeyNameState('has-danger')
                }
                break;
            default:
                break;
        }
        setVckeyName(toUpper(event.target.value));
    };

    return (
        <Modal isOpen={openDialog} toggle={toggle}
               size="md" >
            <ModalHeader className="justify-content-center" toggle={toggle}>
                {label.newLawfirm.label1}
            </ModalHeader>
            <ModalBody>

                <Card>
                    <CardHeader>
                    </CardHeader>
                    <CardBody>
                        <>
                            <InputGroup size="lg"
                                        className={classnames( vckeyNameState, {
                                            'input-group-focus': vckeyNameFocus
                                        } )}
                            >
                                <InputGroupAddon addonType="prepend">
                                    <InputGroupText>
                                        <i className="tim-icons icon-single-02"/>
                                    </InputGroupText>
                                </InputGroupAddon>
                                <Input bsSize="lg"
                                       name="vckeyName"
                                       placeholder={label.common.label14}
                                       type="text"
                                       value={vckeyName}
                                       onChange={e => change( e, 'vckeyName', 'length', 6 )}
                                       onFocus={e => setVckeyNameFocus( true)}
                                       onBlur={e => setVckeyNameFocus( false)}
                                />
                            </InputGroup>
                            {vckeyNameState === 'has-danger' ? (
                                <label className="error">{label.wizardSignup.label5}</label>
                            ) : (
                                <label className="error">{label.wizardSignup.label4}</label>
                            )}
                        </>

                    </CardBody>
                </Card>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={toggle}>{label.common.close}</Button>
                <Button color="primary" type="button" disabled={loadingSave || vckeyNameState !== 'has-success'}
                        onClick={_create}
                >
                    {loadingSave ? (
                        <Spinner
                            size="sm"
                            color="secondary"
                        />
                    ) : null}
                    {' '}{label.common.new}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
