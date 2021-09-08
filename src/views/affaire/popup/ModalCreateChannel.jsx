import React, { useEffect, useState } from 'react';
import {
    Button, CardTitle,
    Col,
    FormGroup,
    FormText,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
    Spinner
} from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import Select from 'react-select';
import { checkPartiesInvolvedIntoChannel, createChannel } from '../../../services/transparency/CaseService';
import ChannelDTO from '../../../model/affaire/ChannelDTO';
import ItemPartie from '../../../model/affaire/ItemPartie';
import ItemDTO from '../../../model/ItemDTO';

const isNil = require( 'lodash/isNil' );
const map = require( 'lodash/map' );
const size = require( 'lodash/size' );
const isEmpty = require( 'lodash/isEmpty' );

export default function ModalCreateChannel( {
                                                label, partiesCas, affaireId, channelsId, showMessage,
                                                modalDisplay,
                                                toggleModalDetails
                                            } ) {
    const [loading, setLoading] = useState( false );
    const [partieSelected, setPartieSelected] = useState( [] );
    const { getAccessTokenSilently } = useAuth0();

    const _createChannel = async () => {
        setLoading( true );

        if(isNil(partieSelected) || isEmpty(partieSelected) || size(partieSelected) <= 1) {
            showMessage(label.casJuridiqueForm.alert3, 'danger');
            setLoading( false );

            return;
        }
        if( size(partieSelected) !== 2 ) {
            showMessage(label.casJuridiqueForm.alert4, 'danger');
            setLoading( false );

            return;
        }
        const accessToken = await getAccessTokenSilently();
        const channel = new ChannelDTO();
        channel.parties = map(partieSelected, part=>{
            return new ItemPartie({id:part.value, label:part.label, email:part.email})
        });

        const resultParties = await checkPartiesInvolvedIntoChannel( accessToken, affaireId, channel );
        if(resultParties.data && resultParties.data === true) {
            showMessage(label.casJuridiqueForm.alert2, 'danger');
            setLoading( false );

            return;
        }

        const result = await createChannel( accessToken, affaireId, channel );

        if ( !result.error ) {
            showMessage(label.casJuridiqueForm.success1, 'primary');

        } else {
            showMessage(label.common.error4, 'danger');
        }

        setLoading( false );
    };

    const partieOptions =
         map(partiesCas, part=>{
            return new ItemDTO({value:part.id,  label: part.label, email: part.email})
        });

    return (
        <Modal size="md" isOpen={modalDisplay} toggle={toggleModalDetails}>
            <ModalHeader toggle={toggleModalDetails}>
                <CardTitle tag="h4">{label.casJuridiqueForm.label107}</CardTitle>
            </ModalHeader>
            <ModalBody>
                <Row>
                    {/*<!-- parties involved -->*/}
                    <Col lg={12} md={12} sm={12}>
                        <Label>
                            {label.casJuridiqueForm.label108}

                        </Label>
                        <FormGroup>
                            <Select
                                isMulti
                                value={partieSelected}
                                className="react-select info"
                                classNamePrefix="react-select"
                                name="singleSelect"
                                onChange={value => setPartieSelected( value )}
                                options={partieOptions}
                            />
                            <FormText color="muted">
                                {label.casJuridiqueForm.label109}
                            </FormText>
                        </FormGroup>
                    </Col>
                </Row>

            </ModalBody>
            <ModalFooter>
                <Button color="default" onClick={toggleModalDetails}>{label.common.close}</Button>
                <Button color="primary" type="button" disabled={loading}
                        onClick={_createChannel}
                >
                    {loading ? (
                        <Spinner
                            size="sm"
                            color="secondary"
                        />
                    ) : null}
                    {' '}{label.common.add}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
