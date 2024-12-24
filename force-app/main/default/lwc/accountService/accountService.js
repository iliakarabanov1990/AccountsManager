import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from "lightning/navigation";

import ACCOUNT_OBJECT from "@salesforce/schema/Account";
import NAME_FIELD from "@salesforce/schema/Account.Name";
import PHONE_FIELD from "@salesforce/schema/Account.Phone";
import FAX_FIELD from "@salesforce/schema/Account.Fax";

import sendRequast from "@salesforce/apex/AccountServiceController.sendRequast";

export default class AccountService extends NavigationMixin(LightningElement) {

    @track accountData = [];
    accountObject = ACCOUNT_OBJECT;
    
    accountColumns = [];
    searchStr = '';
    isLoading = true;
    createFormVisible = false;
    
    accountFields = [NAME_FIELD, PHONE_FIELD, FAX_FIELD];
    fieldApiNames = [];
    offset = 0;
    limit = 10;

    get accountTableVisible() { return this.accountData.length !== 0; }

    get disablePrevious() { return this.offset <= 0; }

    get disableNext() { return this.accountData.length < this.limit; } 

    connectedCallback() {

        this.toggleSpinner(true);

        this.accountColumns = [
            {   label: 'Name',  fieldName: 'Name',  type: 'text', 	editable: true },        
            {   label: 'Phone', fieldName: 'Phone', type: 'phone',	editable: true },        
            {   label: 'Fax',   fieldName: 'Fax',   type: 'text',	editable: true },         
            {   type: "button", initialWidth: 100,   typeAttributes: { label: 'Del', name: 'Del', title: 'Del', variant: 'destructive'}} ]; 
        
        this.fieldApiNames = this.accountFields.map(el => el.fieldApiName);

        this.toggleSpinner(false);
    }

    async handleSubmitCreateForm(event) {
     
        event.preventDefault();

        this.toggleSpinner(true);

        const updateFields = this.fieldApiNames.reduce((obj, el) => Object.assign(obj, {[el]: event.detail.fields[el]}), {});
        const param = {
            method: 'POST',
            paramsMap: {},
            body: JSON.stringify([updateFields]) };
   
        try {
            const answer = await sendRequast(param);

            if(answer.status === '200') { 
                //sort accounts after new was added
                this.accountData = [...this.accountData, ...answer.body].sort((a, b) => {
                    const nameA = a.Name.toUpperCase(); 
                    const nameB = b.Name.toUpperCase(); 
                    if (nameA < nameB) { return -1; }
                    if (nameA > nameB) { return 1; }                 
                    return 0;
                });  

                this.dispatchEvent(new ShowToastEvent({title: 'Account was created', variant: 'success', message: JSON.stringify(answer.body)})); 

            } else { this.dispatchEvent(new ShowToastEvent({title: 'ERROR', variant: 'error', message: JSON.parse(answer.body)[0].message})) } 
        }
        catch(error) {
            this.dispatchEvent(new ShowToastEvent({title: 'ERROR', variant: 'error', message: error.body.message})) } 

        this.createFormVisible = false;

        this.toggleSpinner(false);
    }

    async handleUpdateSelectedRecords(event) {

        this.toggleSpinner(true);

        const changedData = event.detail.draftValues;

        const param = {
            method: 'PATCH',
            paramsMap: {},
            body: JSON.stringify(changedData) };

        try {
            const answer = await sendRequast(param);

            if(answer.status === '200') { 
                this.dispatchEvent(new ShowToastEvent({title: 'Accounts were updated', variant: 'success', message: JSON.stringify(answer.body)})); 
            }
            else { this.dispatchEvent(new ShowToastEvent({title: 'ERROR', variant: 'error', message: JSON.parse(answer.body)[0].message})) } 
        }
        catch(error) {
            this.dispatchEvent(new ShowToastEvent({title: 'ERROR', variant: 'error', message: error.body.message})) } 

        changedData.forEach(data => { this.accountData = this.accountData.map(el => el.Id === data.Id ? {...el, ...data} : el) });
        
        this.toggleSpinner(false);
    }

    handleRowAcction(event) {
        switch (event.detail.action.name) {
            case 'Del': this.deleteRecord(event.detail.row.Id); break;
            default: break;
        }
    } 

    async handleNewAccountButton() {        
        this.createFormVisible = true;
    }

    handleCreateFormCancel() {
        this.createFormVisible = false;   
    }

    handleSearch(event) {
        this.searchStr = event.target.value.trim();  
    }

    async handleSearchtButton() { 
        this.offset = 0;
        this.getAccounts();  
        if(this.accountData.length > 0) { this.offset += this.limit; }
    }

    handleModalCancel() {
        this[NavigationMixin.Navigate]({
            type: 'standard__namedPage',
            attributes: { pageName: 'home' },
        });
    }

    toggleSpinner(isLoading) {
        this.isLoading = isLoading;
    }

    handlePrevious() {
        this.offset -= this.limit;   
        this.getAccounts();
    }

    handleNext() {
        this.offset += this.limit;       
        this.getAccounts();      
    }

    async getAccounts() { 

        this.accountData = [];
        let answer;

        this.toggleSpinner(true);

        const param = {
            method: 'GET',
            paramsMap: {'fields': this.fieldApiNames.join(','), 'name' : this.searchStr, 'offset': this.offset, 'limit': this.limit} };  
       
        try {
            answer = await sendRequast(param);
            if(answer.status !== '200') { 
                this.dispatchEvent(new ShowToastEvent({title: 'ERROR', variant: 'error', message: JSON.parse(answer.body)[0].message}));
                answer.body = [];
            } 
        } catch(error) {
            this.dispatchEvent(new ShowToastEvent({title: 'ERROR', variant: 'error', message: error.body.message})) } 
 
        this.accountData = answer.body;    

        this.toggleSpinner(false);
    }

    async deleteRecord(accId) {

        this.toggleSpinner(true);

        const param = {
            method: 'DELETE',
            paramsMap: {'Id': accId} };

        try {
            const answer = await sendRequast(param);

            if(answer.status === '200') { 

                this.accountData.splice(this.accountData.indexOf(this.accountData.find(el => el.Id === accId)), 1);
                this.accountData = [...this.accountData];

                this.dispatchEvent(new ShowToastEvent({title: 'Account was deleted', variant: 'success', message: JSON.stringify(answer.body)})); 

            } else { this.dispatchEvent(new ShowToastEvent({title: 'ERROR', variant: 'error', message: JSON.parse(answer.body)[0].message})) } 
        }
        catch(error) {
            this.dispatchEvent(new ShowToastEvent({title: 'ERROR', variant: 'error', message: error.body.message})) } 

        this.toggleSpinner(false);
    }
}