import titleClient from '../affaire/TitleClient';
import typeClient from '../affaire/TypeClient';
import ItemDTO from '../ItemDTO';

export default class ContactSummary {
	type = 1;
	typeItem = {value: 1};
	title = 'F';
	titleItem = titleClient[0];
	language = 'fr';
	languageItem = null;
	address = null;
	cp = null;
	city = null;
	tel = null;
	mobile = null;
	fax = null;
	nrnat = null;
	etr = null;
	tva = null;
	birthdate = '';

	country;
	countryItem ;

	id;
	fullName = '';
	email = '';
	phone;
	firstname = '';
	lastname = '';
	company = '';
	userId ;
	vcKey = '';
	iban = '';
	bic = '';

	constructor(profile, label) {
		this.typeItem = typeClient(label)[0];
		if(profile) {
			this.type = profile.type;
			typeClient(label).forEach( typed => {
				if (this.type && typed.value === this.type ) {
					this.typeItem = new ItemDTO(typed);
				}
			} );

			if(profile.title) {
				this.title = profile.title;
				this.titleItem = profile.titleItem;
			}
			this.country = profile.country;
			this.countryItem = profile.countryItem;
			this.language = profile.language;
			this.languageItem = profile.languageItem;
			this.cp = profile.cp;
			this.city = profile.city;
			this.address = profile.address;
			this.tel = profile.tel;
			this.mobile = profile.mobile;
			this.fax = profile.fax;
			this.nrnat = profile.nrnat;
			this.etr = profile.etr;
			this.tva = profile.tva;
			this.birthdate = profile.birthdate;
			this.id = profile.id;
			this.fullName = profile.fullName;
			this.email = profile.email;
			this.phone = profile.phone;
			this.firstname = profile.firstname;
			this.lastname = profile.lastname;
			this.company = profile.company;
			this.address = profile.address;
			this.userId = profile.userId;
			this.vcKey = profile.vcKey;
			this.iban = profile.iban;
			this.bic = profile.bic;

		}
	}
}
