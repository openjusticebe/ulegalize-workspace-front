export default class ObjectResponseDTO {
    id;
    name;
    url;
    etag;
    size;
    lastModified;
    container;

    constructor( data ) {
        this.id = data.id;
        this.name = data.name;
        this.url = data.url;
        this.etag = data.etag;
        this.size = data.size;
        this.lastModified = data.lastModified;
        this.container = data.container;
    }

}
