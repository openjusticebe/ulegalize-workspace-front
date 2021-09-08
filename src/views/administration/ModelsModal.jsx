import React, { useEffect, useRef, useState } from 'react';
import {
    Button,
    Col,
    FormGroup,
    FormText,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    PopoverBody,
    PopoverHeader,
    Row,
    UncontrolledPopover,
} from 'reactstrap';
import Select from 'react-select';
import { useAuth0 } from '@auth0/auth0-react';
import CircularProgress from '@material-ui/core/CircularProgress';
import ItemDTO from '../../model/ItemDTO';
import { getContextModel, getTemplateModel } from '../../services/SearchService';
import ModelDTO from '../../model/admin/model/ModelDTO';
import { createModels, getTemplatData, updateModels, uploadModel } from '../../services/AdminService';
import { getOptionNotification } from '../../utils/AlertUtils';
import NotificationAlert from 'react-notification-alert';
import ImageUpload from '../../components/CustomUpload/ImageUpload';

const filter = require( 'lodash/filter' );
const keys = require( 'lodash/keys' );
const map = require( 'lodash/map' );
const isNil = require( 'lodash/isNil' );
const isEmpty = require( 'lodash/isEmpty' );

export default function ModelsModal( {
                                         modal,
                                         toggleIn,
                                         item,
                                         label,
                                         handleSucess,
                                         handleError,
                                         handleshowAlert
                                     } ) {
    const { getAccessTokenSilently } = useAuth0();
    const notificationAlert = useRef( null );
    const [data, setData] = useState( new ModelDTO() );
    const [contextList, setContextList] = useState( [] );
    const [templateData, setTemplateData] = useState( [] );
    const [templateList, setTemplateList] = useState( [] );
    const [formatList] = useState( [new ItemDTO( { value: 'D', label: label.models.label100 } )] );
    const [loading, setLoading] = useState( false );

    useEffect( () => {
        let modelDTO = new ModelDTO( item );

        setData( modelDTO );

    }, [item] );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            let result = await getContextModel( accessToken );
            let contexts = map( result.data, data => {
                return new ItemDTO( data );
            } );

            setContextList( contexts );

            let resultTenmplate = await getTemplateModel( accessToken );
            if ( !isEmpty( resultTenmplate.data ) ) {
                let templates = map( resultTenmplate.data, data => {
                    return new ItemDTO( data );
                } );

                setTemplateList( templates );
                // set by default or get from DB
                // get from db
                if ( !isNil( item.template ) ) {
                    setData( { ...item, template: item.template.label, templateItem: item.templateItem } );

                } else {
                    // get the firtst one
                    setData( { ...item, template: templates[ 0 ].label, templateItem: templates[ 0 ] } );

                }
            }

            // list of template data while models must be generated
            let resultData = await getTemplatData( accessToken );
            if ( !resultData.error ) {
                setTemplateData( resultData.data );
            }

        })();
    }, [getAccessTokenSilently] );

    const handleSave = async () => {
        if ( data == null ) {
            handleError( label.models.label9 );
            return;
        }
        if ( isNil( data.format ) ) {
            notificationAlert.current.notificationAlert(
                getOptionNotification( label.models.label102, 'danger' )
            );
            return;
        }
        if ( isNil( data.context ) ) {
            notificationAlert.current.notificationAlert(
                getOptionNotification( label.models.label103, 'danger' )
            );
            return;
        }
        if ( isNil( data.name ) ) {
            notificationAlert.current.notificationAlert(
                getOptionNotification( label.models.label104, 'danger' )
            );
            return;
        }
        if ( isNil( data.description ) ) {
            notificationAlert.current.notificationAlert(
                getOptionNotification( label.models.label105, 'danger' )
            );
            return;
        }

        const accessToken = await getAccessTokenSilently();
        let result;
        if ( isNil( data.id ) ) {
            result = await createModels( accessToken, data );
        } else {
            result = await updateModels( accessToken, data );
        }
        if ( !result.error ) {
            handleSucess();
            setLoading( false );
        } else {
            handleError( label.common.error2 );
            setLoading( false );
        }

    };
    const _uploadModel = async ( file ) => {
        const extension = file.name.split( '.' ).pop();
        if ( extension !== 'doc' && extension !== 'docx' ) {
            handleshowAlert( label.models.error1, 'danger' );

            return;
        }

        let formData = new FormData();

        formData.append( 'files', file );
        const accessToken = await getAccessTokenSilently();

        const result = await uploadModel( accessToken, formData );

        if ( !result.error ) {
            handleshowAlert( label.models.success1, 'primary' );

            let resultTenmplate = await getTemplateModel( accessToken );
            if ( !isEmpty( resultTenmplate.data ) ) {
                let templates = map( resultTenmplate.data, data => {
                    return new ItemDTO( data );
                } );
                // the default must the new uploaded

                const tempSelected = filter( templates, template => {
                    return template.label === file.name;
                } );

                setTemplateList( templates );
                if ( !isNil( tempSelected ) ) {
                    setData( { ...data, template: tempSelected[ 0 ].label, templateItem: tempSelected[ 0 ] } );

                }
            }

        }
    };

    return (
        <Modal size="lg" isOpen={modal} toggle={toggleIn}>
            <ModalHeader toggle={toggleIn}>
                <h4>{label.models.label12}</h4>
            </ModalHeader>
            <ModalBody>
                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert}/>
                </div>
                {/* 1 row */}
                <Row>
                    <Col md="5" sm={6}>
                        <FormGroup>
                            <Label>{label.models.label1}</Label>
                            <Select
                                isDisabled={data.type === 'S'}
                                name="optionGroup"
                                className="react-select drop-up"
                                classNamePrefix="react-select"
                                value={data.contextItem}
                                onChange={value => setData( {
                                    ...data,
                                    context: value.value,
                                    contextItem: new ItemDTO( value )
                                } )
                                }
                                options={contextList}
                            />
                        </FormGroup>
                        <Button id="UncontrolledPopover" type="button" className="btn-link">
                            {label.models.label106}
                        </Button>
                        <UncontrolledPopover placement="bottom" target="UncontrolledPopover">
                            <PopoverHeader> {label.models.label107}</PopoverHeader>
                            <PopoverBody>{templateData ? keys( templateData ).map( ( key ) => {
                                return (
                                    <p>{key}</p>
                                );
                            } ) : null}</PopoverBody>
                        </UncontrolledPopover>
                    </Col>

                    <Col md="5" sm={6}>
                        <FormGroup>
                            <Label>{label.models.label2}</Label>
                            <Select
                                isDisabled={item.type === 'S'}
                                name="optionGroup"
                                className="react-select drop-up"
                                classNamePrefix="react-select"
                                value={data.formatItem}
                                onChange={value => setData( {
                                    ...data,
                                    format: value.value,
                                    formatItem: new ItemDTO( value )
                                } )
                                }
                                options={formatList}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                {/* 2 row */}
                <Row>
                    <Col md="5" sm={6}>
                        <FormGroup>
                            <Label>{label.models.label3}</Label>
                            <Input
                                value={data.name}
                                disabled={item.type === 'S'}
                                type="text"
                                onChange={( e ) => setData( { ...data, name: e.target.value } )}
                            />
                        </FormGroup>
                    </Col>

                    <Col md="5" sm={6}>
                        <FormGroup>
                            <Label>{label.models.label4}</Label>
                            <Input
                                value={data.description}
                                disabled={item.type === 'S'}
                                type="text"
                                onChange={( e ) => setData( { ...data, description: e.target.value } )}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                {/* 3 row */}
                <Row>
                    {item.type === 'S' ? (
                        <Col md="6" sm={6}>
                            <FormGroup>
                                <Label>{label.models.label9}</Label>
                                <Input
                                    value={data.template}
                                    type="textarea"
                                    rows={9}
                                    onChange={( e ) => setData( { ...data, template: e.target.value } )}
                                />
                            </FormGroup>
                        </Col>
                    ) : (
                        <Col md="6" sm={6}>
                            <FormGroup>
                                <Label>{label.models.label5}</Label>
                                <Select
                                    name="optionGroup"
                                    className="react-select"
                                    classNamePrefix="react-select"
                                    value={data.templateItem}
                                    onChange={value => setData( {
                                        ...data,
                                        template: value.label,
                                        templateItem: new ItemDTO( value )
                                    } )
                                    }
                                    options={templateList}
                                />
                                <FormText color="muted">
                                    {label.models.label6}
                                </FormText>
                            </FormGroup>
                        </Col>
                    )}
                    {/* UPLOAD DIRECTLY DOC */}
                    {item.type !== 'S' ? (
                        <Col md="6" sm={6}>
                            <FormGroup>
                                <Label>{label.models.label14}</Label>
                                <ImageUpload avatar={null} saveFile={_uploadModel}/>
                            </FormGroup>
                        </Col>
                    ) : null}
                </Row>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={() => toggleIn()}>
                    {label.models.label8}
                </Button>
                {loading && <CircularProgress color="primary" size={35}/>}
                <Button color="primary" onClick={handleSave} disable={loading}>
                    {label.models.label7}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
