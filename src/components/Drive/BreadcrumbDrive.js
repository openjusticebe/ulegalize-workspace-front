import React, { Component } from 'react';
import { Breadcrumb, BreadcrumbItem, Button } from 'reactstrap';

const map = require( 'lodash/map' );
const split = require( 'lodash/split' );
const isEmpty = require( 'lodash/isEmpty' );
const size = require( 'lodash/size' );

class BreadcrumbDrive extends Component {
    _handleFolder( path ) {
            this.props.getFolderDrive( path );
    }

    render() {
        const { drive, isLoading } = this.props;

        if ( isLoading || isEmpty( drive ) ) {
            return (
                <Breadcrumb key="breadDrive">
                    <BreadcrumbItem
                        key="bdr1">
                        <Button color="link"
                                onClick={this._handleFolder.bind( this, null )}><i className="fa fa-home"/>
                        </Button></BreadcrumbItem>
                </Breadcrumb>
            );
        }

        let folders;
        let folderCount;

        // must be not null
        if ( drive ) {
            folderCount = size( drive.match( new RegExp( '/', 'g' ) ) );
            let fullpath = drive ? split( drive, '/', folderCount ) : null;

            // add first path "/"
            fullpath.splice( 0, 0, '/' );
            let first = true;
            let pathBread = '';

            // list of folders
            folders = map( fullpath, ( path ) => {
                if ( first ) {
                    first = false;
                    return (
                        <BreadcrumbItem key="bdr1">
                            <Button color="link"
                                    onClick={this._handleFolder.bind( this, '' )}><i className="fa fa-home"/>
                            </Button></BreadcrumbItem>
                    );
                } else {
                    pathBread += `${path}/`;
                    return (
                        <BreadcrumbItem key={path}>
                            <Button color="link"
                                    onClick={this._handleFolder.bind( this, pathBread )}>{path}</Button></BreadcrumbItem>

                    );
                }
            } );
        }

        return (
            <Breadcrumb key="breadDrive">
                {folders}
            </Breadcrumb>
        );
    }
}

export default BreadcrumbDrive;
