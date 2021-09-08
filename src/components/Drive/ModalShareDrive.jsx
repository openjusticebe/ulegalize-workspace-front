import React, { useEffect, useState } from 'react';
import {
    Button,
    Col,
    FormGroup,
    Label,
    Modal,
    Row,
    Input,
    ModalHeader,
    ModalBody,
    ModalFooter
} from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import Select from 'react-select';
import ItemDTO from '../../model/ItemDTO';
import { getShareUsers } from '../../services/DriveService';
import ShareFileDTO from '../../model/drive/ShareFileDTO';
import { getFullUserList } from '../../services/SearchService';
import AsyncCreatableSelect from 'react-select/async-creatable';

const map = require( 'lodash/map' );

export default function ModalShareDrive( { label, modalDisplay, saveShare, toggle, path } ) {
    const [data, setData] = useState( new ShareFileDTO() );
    const { getAccessTokenSilently } = useAuth0();



    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            const result = await getShareUsers(accessToken, path.name);

            if(!result.error) {
                let share = new ShareFileDTO(result.data);
                share.right = 0;
                share.rightItem = new ItemDTO({
                    value: 0,
                    label: label.drive.label17
                });
                setData(share);
            }
        })();
    }, [getAccessTokenSilently] );

    const _loadUsersOptions = async ( inputValue, callback ) => {
        const accessToken = await getAccessTokenSilently();
        let result = await getFullUserList( accessToken, inputValue );

        callback( map( result.data, data => {
            return new ItemDTO( data );
        } ) );
    };


    const _saveShare =  async() => {
        await saveShare( data );
        toggle();
    }

    const _removeEmail = (email) => {
        const emailsTemp = data.shared_with;
        const index = emailsTemp.indexOf(email);
        if (index > -1) {
            emailsTemp.splice(index, 1);
        }
        setData( { ...data, shared_with: emailsTemp });
    }


        return (
            <Modal size="md"  isOpen={modalDisplay} toggle={toggle}>
                <ModalHeader toggle={toggle}>
                    <h4 className="modal-title">{label.drive.label9}
                    </h4>
                </ModalHeader>
                <ModalBody>
                    {/*<!-- user -->*/}
                    <Row>
                        <Col lg={12} md={12} sm={12}>
                            <Label>
                                {label.drive.label10}

                            </Label>
                            <FormGroup>
                                <AsyncCreatableSelect
                                    isMulti
                                    cacheOptions
                                    value={data.usersItem || ''}
                                    className="react-select info"
                                    classNamePrefix="react-select"
                                    name="singleSelect"
                                    onChange={value => setData( {
                                        ...data,
                                        usersItem: value,
                                        usersId: map(value , val=>{
                                            return val.value;
                                        })
                                    } )}
                                    loadOptions={_loadUsersOptions}
                                    placeholder={label.drive.label10}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    {/*<!-- msg -->*/}
                    <Row>
                        <Col lg={12} md={12} sm={12}>
                            <Label>
                                {label.drive.label11}

                            </Label>
                            <FormGroup>
                                <Input
                                    rows={4}
                                    name="content"
                                    type="textarea"
                                    className="form-control"
                                    placeholder={label.drive.label12}
                                    value={data.msg}
                                    onChange={( e ) => setData( { ...data, msg: e.target.value } )}
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    {/*<!-- Rights -->*/}
                    <Row>
                        <Col lg={12} md={12} sm={12}>
                            <Label>
                                {label.drive.label14}

                            </Label>
                            <FormGroup>
                                <Select
                                    name="optionGroup"
                                    className="react-select"
                                    classNamePrefix="react-select"
                                    value={data.rightItem}
                                    onChange={value => setData( {
                                        ...data,
                                        right : value.value,
                                        rightItem : value
                                    }) }
                                    options={[
                                        {
                                            value: 0,
                                            label: label.drive.label17
                                        },
                                        {
                                            value: 1,
                                            label: label.drive.label18
                                        }
                                    ]}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    {/*<!-- shsare with -->*/}
                    <Row>
                        <Col lg={12} md={12} sm={12}>
                            <Label>
                                {label.drive.label15}

                            </Label>
                            <FormGroup>
                                <ul>

                                {map(data.shared_with , email =>{
                                   return (
                                       <li key={email}>
                                           {email}
                                           <Button
                                               color="btn-icon  btn-link"
                                               onClick={()=>_removeEmail(email)}><i className="tim-icons icon-simple-remove red"/>
                                           </Button>
                                       </li>
                                   )
                                })}
                                </ul>

                            </FormGroup>
                        </Col>
                    </Row>

                </ModalBody>
                <ModalFooter>
                    <Button color="default" onClick={toggle}>{label.common.close}</Button>
                    <Button color="default" onClick={_saveShare}>{label.drive.label7}</Button>{' '}
                </ModalFooter>
            </Modal>
        );
}
