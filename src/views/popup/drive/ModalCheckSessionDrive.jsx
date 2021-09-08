import React, { useEffect, useState } from 'react';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Modal,
    ModalBody,
    ModalHeader,
    Spinner, FormText
} from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import { checkToken, startDropbox } from '../../../services/DriveService';

const isNil = require( 'lodash/isNil' );

export default function ModalCheckSessionDrive( { checkTokenDrive, toggle, label  } ) {
    const { getAccessTokenSilently } = useAuth0();
    const [loadingSave, setLoadingSave] = useState( false );
    const [openDialog, setOpenDialog] = useState( false );

    useEffect( () => {
        (async () => {
            try {
                const accessToken = await getAccessTokenSilently();

                if(!isNil(checkTokenDrive) ) {
                    // check session
                    const result = await checkToken(accessToken);
                    if(result.data === false) {
                        setOpenDialog(true)
                    }
                }
            } catch ( e ) {
                //logout( { returnTo: process.env.REACT_APP_MAIN_URL } );

            }
        })();
    }, [getAccessTokenSilently] );

    const _associateDrive = async () => {
        let accessToken = await getAccessTokenSilently();
        setLoadingSave(true);
        let result = await startDropbox( accessToken );

        setLoadingSave(false);
        if ( !result.error && result.data !== '' ) {
            window.location = result.data;
            //toggle(label.drive.refreshDrive, 'primary')
        } else {
            toggle(label.drive.errorRefreshDrive, 'error')
        }
    };
    return (
        <Modal isOpen={openDialog} toggle={toggle}
               size="md" >
            <ModalHeader className="justify-content-center" toggle={toggle}>
                {label.drive.label19}
            </ModalHeader>
            <ModalBody>

                <Card>
                    <CardHeader>
                    </CardHeader>
                    <CardBody>
                        <Button id="dropboxRefreshAuthButton"
                                block={true}
                                onClick={_associateDrive}
                                color="primary"
                        >
                            {loadingSave ? (
                                <Spinner
                                    size="sm"
                                    color="secondary"
                                />
                            ) : null}
                            {' '}{label.generalInfo.label6}
                            </Button>

                        <FormText color="muted">
                            {label.drive.label20}
                        </FormText>
                    </CardBody>
                </Card>
            </ModalBody>
        </Modal>
    );
}
