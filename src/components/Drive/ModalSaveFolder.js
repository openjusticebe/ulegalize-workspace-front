import React, { useEffect, useState } from 'react';

import {
    Button,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from 'reactstrap';

const includes = require( 'lodash/includes' );
const split = require( 'lodash/split' );
const last = require( 'lodash/last' );
const size = require( 'lodash/size' );
export default function ModalSaveFolder( {
                                             currentName,
                                             isFolder,
                                             saveFolder,
                                             openModalFolder,
                                             toggleModalFolder,
                                             title,
                                             label,
                                             saveButton
                                         } ) {
    const [value, setValue] = useState( '' );

    useEffect( () => {
        (async () => {
            let fileName;
            // this is a file
            if(currentName && isFolder === false ) {
                 fileName = last( split( currentName, '/' ) ) ;
                 fileName = split( fileName, '.' )[0];
            } else {
                // this is a folder
                const arrayName = split( currentName, '/' );
                fileName = arrayName[size(arrayName) - 2] ;

            }
            setValue( fileName );

        })();
    }, [currentName] );

    const _createFolder = () => {
        saveFolder( value );
        setValue( '' );
    };

    // to be improve if size is not null: FILE
    const extension = currentName && isFolder === false ? currentName.split( '.' ).pop() : null;

    return (
        <Modal size='sm' isOpen={openModalFolder} toggle={toggleModalFolder}>
            <ModalHeader toggle={toggleModalFolder}>{title}</ModalHeader>
            <ModalBody>
                {extension ? (
                    <InputGroup>
                        <Input
                            className="form-control"
                            value={value}
                            onChange={( e ) => {
                                if ( includes( e.target.value, ',' ) ) {
                                    //toastr.error( 'Message', 'La virgule n\'est pas autorisée' );
                                    return;
                                } else if ( includes( e.target.value, '/' ) ) {
                                    //toastr.error( 'Message', 'Le slash n\'est pas autorisé' );
                                    return;
                                }
                                setValue(  e.target.value );
                            }}
                            type="text"/>
                        <InputGroupAddon addonType="append">
                            <InputGroupText><span
                                className="currency-input-text">.{extension}</span></InputGroupText>
                        </InputGroupAddon>
                    </InputGroup>
                ) : (
                    <Input
                        className="form-control"
                        value={value}
                        onChange={( e ) => {
                            if ( includes( e.target.value, ',' ) ) {
                                //toastr.error( 'Message', 'La virgule n\'est pas autorisée' );
                                return;
                            } else if ( includes( e.target.value, '/' ) ) {
                                //toastr.error( 'Message', 'Le slash n\'est pas autorisé' );
                                return;
                            }
                            setValue(  e.target.value );
                        }}
                        type="text"/>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggleModalFolder}>{label.common.cancel}</Button>
                <Button color="secondary" onClick={_createFolder}>{saveButton}</Button>
            </ModalFooter>
        </Modal>
    );
}
