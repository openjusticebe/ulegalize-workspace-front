import React from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import CreateIcon from '@material-ui/icons/Create';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';

export function CustomPopover( { className, style, label } ) {
    return (
        <div
            className={className}
            style={{
                ...style,
                marginLeft: -5,
                marginTop: 5,
                width: '200px'
            }}
        >
            <ListGroup componentClass="ul">
                <ListGroupItem className="color-dark">
                    <CreateIcon className="green"/> {' '} {label.casJuridiqueForm.status1}
                </ListGroupItem>
                <ListGroupItem className="color-dark">
                    <CreateIcon className="red glyphicon-ring" /> {' '} {label.casJuridiqueForm.status2}
                </ListGroupItem>
                <ListGroupItem className="color-dark">
                    <ErrorOutlineOutlinedIcon /> {' '} {label.casJuridiqueForm.status3}
                </ListGroupItem>
            </ListGroup>
        </div>
    );
}
