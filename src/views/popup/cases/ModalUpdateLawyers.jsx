import React, { useState } from 'react';
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import { searchLawfirmByName } from '../../../services/LawfirmsService';
import ItemDTO from '../../../model/ItemDTO';
import AsyncSelect from 'react-select/async/dist/react-select.esm';

const map = require( 'lodash/map' );
const isNil = require( 'lodash/isNil' );
export default function ModalUpdateLawyers( { lawyersProps, modalDetails, toggleModalDetails,
                                                save, cas, isLoading , label} ) {
    const [lawyers, setLawyers] = useState( lawyersProps );
    const { getAccessTokenSilently } = useAuth0();

    const _updateLawyer = ( value ) => {
       setLawyers( value );
    };

    const _loadVckeyOptions = async ( inputValue, callback ) => {
        const accessToken = await getAccessTokenSilently();
        let result = await searchLawfirmByName( accessToken, inputValue );

        if ( !isNil( result ) ) {
            if ( !isNil( result.data ) ) {

                callback(
                    map( result.data, lawfirm => {
                        return new ItemDTO( { value: lawfirm.vckey, label: lawfirm.vckey } );
                    } ) );

            } else if ( result.error ) {
                // no data
            }
        }
    };

    const _save = ( ) => {
        save( lawyers, cas );
    };

    return (
        <Modal size="md" isOpen={modalDetails} toggle={toggleModalDetails}>
            <ModalHeader toggle={toggleModalDetails}>
                Cabinets à associer
            </ModalHeader>
            <ModalBody>
                <Row>
                    <Col lg={8} md={8} sm={10}>
                        <AsyncSelect
                            isMulti
                            value={lawyers}
                            className="react-select info"
                            classNamePrefix="react-select"
                            cacheOptions
                            loadOptions={_loadVckeyOptions}
                            defaultOptions
                            onChange={_updateLawyer}
                        />
                    </Col>
                </Row>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={toggleModalDetails}> {label.common.close}</Button>
                <Button color="primary" type="button" disabled={isLoading}
                        onClick={_save}
                >
                    {isLoading ? (
                        <Spinner
                            size="sm"
                            color="secondary"
                        />
                    ) : null}
                    {' '} {label.common.update}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
