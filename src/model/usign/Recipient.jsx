export default class Recipient {
    left = 0;
    top = 0;

    width = 160;
    height = 80;
    pageNumber = 1;
    sequence = 1;

    constructor( profile ) {
        if ( profile ) {
            this.left = profile.left;
            this.top = profile.top;
            this.width = profile.width;
            this.height = profile.height;
            this.pageNumber = profile.pageNumber;
            this.sequence = profile.sequence;

        }
    }
}
