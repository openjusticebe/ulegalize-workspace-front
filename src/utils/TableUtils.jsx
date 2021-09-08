
export const downloadWithName = ( a, b ) => {
    let blob = b64toBlob( a.binary, a.contentType );
    let blobUrl = URL.createObjectURL( blob );

    if ( navigator.appVersion.toString().indexOf( '.NET' ) > 0 ) {
        window.navigator.msSaveOrOpenBlob( blob, b );
    } else {

        let g = document.createElement( 'a' );
        document.body.appendChild( g );
        g.style = 'display: none';

        g.href = blobUrl;
        g.download = b;
        g.click();

        setTimeout( function () {
            document.body.removeChild( g );
        }, 100 );
    }
}
export const b64toBlob = ( b64Data, contentType, sliceSize ) => {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    let byteCharacters = atob( b64Data );
    let byteArrays = [];

    for ( let offset = 0; offset < byteCharacters.length; offset += sliceSize ) {
        let slice = byteCharacters.slice( offset, offset + sliceSize );

        let byteNumbers = new Array( slice.length );
        for ( let i = 0; i < slice.length; i++ ) {
            byteNumbers[ i ] = slice.charCodeAt( i );
        }

        let byteArray = new Uint8Array( byteNumbers );

        byteArrays.push( byteArray );
    }

    let blob = new Blob( byteArrays, { type: contentType } );
    return blob;
}

export const downloadBlob = ( blob, filename ) => {
    let blobUrl = URL.createObjectURL( blob );

    if ( navigator.appVersion.toString().indexOf( '.NET' ) > 0 ) {
        window.navigator.msSaveOrOpenBlob( blob, filename );
    } else {

        let g = document.createElement( 'a' );
        document.body.appendChild( g );
        g.style = 'display: none';

        g.href = blobUrl;
        g.download = filename;
        g.click();

        setTimeout( function () {
            document.body.removeChild( g );
        }, 100 );
    }
}