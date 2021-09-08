import React, { useEffect, useRef, useState } from 'react';
// used for making the prop types of this component
import PropTypes from 'prop-types';

import { Button } from 'reactstrap';

import pdf_thumbnail from 'assets/img/pdf_thumbnail.png';
import defaultImage from 'assets/img/image_placeholder.jpg';
import defaultAvatar from 'assets/img/placeholder.jpg';

function PdfUpload( {
                          avatar, isLoading, defaultImgBackground,
                          addBtnColor, addBtnClasses, changeBtnColor, changeBtnClasses,
                          removeBtnColor, removeBtnClasses, saveFile
                      } ) {

    const [file, setFile] = useState( null );
    const [imagePreviewUrl, setImagePreviewUrl] = useState( avatar ? `data:image/jpeg;base64,${avatar}` : defaultImage );
    const fileInput = useRef( null );

    useEffect( () => {
        (async () => {
            setImagePreviewUrl( avatar ? `data:image/jpeg;base64,${avatar}` : defaultImage );
        })();
    }, [avatar] );

    const handleImageChange = ( e ) => {
        e.preventDefault();
        let reader = new FileReader();
        let fileTemp = e.target.files[ 0 ];
        reader.onloadend = () => {
            setFile( file );
            saveFile( fileTemp );
            const type = reader.result.indexOf( 'data:application/pdf;' );

            // it's a pdf
            if ( type === 0 ) {
                setImagePreviewUrl( pdf_thumbnail );
            } else {
                setImagePreviewUrl( reader.result );
            }

        };
        reader.readAsDataURL( fileTemp );
    };
    const handleClick = ( e ) => {
        fileInput.current.click();
    };
    const handleRemove = ( e ) => {
        setFile( null );
        setImagePreviewUrl( avatar ? defaultAvatar : defaultImage );

        fileInput.current.value = null;
    };

    return (
        <div className="fileinput text-center">
            <input type="file"
                   accept="application/pdf"
                   onChange={handleImageChange} ref={fileInput}/>
            <div className={'thumbnail' + (avatar ? ' img-circle' : '')}>
                <img src={imagePreviewUrl} alt="..."/>
                {defaultImgBackground ? <img src={defaultImgBackground} alt="..."/> : null}
            </div>
            <div>
                {file === null ? (
                        <Button
                            disabled={isLoading}
                            color={addBtnColor}
                            className={addBtnClasses}
                            onClick={() => handleClick()}
                        >
                            {isLoading ? 'Loading ...' : 'Select pdf'}
                        </Button>
                ) : (
                    <span>
              <Button
                  color={changeBtnColor}
                  className={changeBtnClasses}
                  onClick={() => handleClick()}
              >
                Change
              </Button>
                        {avatar ? <br/> : null}
                        <Button
                            color={removeBtnColor}
                            className={removeBtnClasses}
                            onClick={() => handleRemove()}
                        >
                <i className="fa fa-times"/> Remove
              </Button>
            </span>
                )}
            </div>
        </div>
    );

}

PdfUpload.defaultProps = {
    avatar: false,
    removeBtnClasses: 'btn-round',
    removeBtnColor: 'danger',
    addBtnClasses: 'btn-round',
    addBtnColor: 'primary',
    changeBtnClasses: 'btn-round',
    changeBtnColor: 'primary'
};

PdfUpload.propTypes = {
    avatar: PropTypes.bool,
    removeBtnClasses: PropTypes.string,
    removeBtnColor: PropTypes.oneOf( [
        'default',
        'primary',
        'secondary',
        'success',
        'info',
        'warning',
        'danger',
        'link'
    ] ),
    addBtnClasses: PropTypes.string,
    addBtnColor: PropTypes.oneOf( [
        'default',
        'primary',
        'secondary',
        'success',
        'info',
        'warning',
        'danger',
        'link'
    ] ),
    changeBtnClasses: PropTypes.string,
    changeBtnColor: PropTypes.oneOf( [
        'default',
        'primary',
        'secondary',
        'success',
        'info',
        'warning',
        'danger',
        'link'
    ] )
};

export default PdfUpload;
