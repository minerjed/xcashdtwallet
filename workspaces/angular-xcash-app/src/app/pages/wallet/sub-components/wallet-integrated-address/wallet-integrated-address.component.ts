import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { ActivatedRoute } from '@angular/router';
import { faEdit, faCopy } from '@fortawesome/free-solid-svg-icons';
import { integratedAddress } from 'src/app/models/integratedaddress'
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { rpcReturn } from 'src/app/models/rpc-return';
declare var $: any;

@Component({
  selector: 'app-wallet-integrated-address',
  templateUrl: './wallet-integrated-address.component.html',
  styleUrls: ['./wallet-integrated-address.component.sass']
})
export class WalletIntegratedAddressComponent implements OnInit {
  @ViewChild('subaddid') table!: ElementRef;
  intAddresses: integratedAddress[] = [];
  faEdit = faEdit;
  faCopy = faCopy;
  hidetrans: boolean = true;
  showaddModal: boolean = false;
  nointAddress: boolean = true;
  message: string = "";
  subcount: any = 0;
  walletaddress: string = "";
  newcount: any = "";
  showspinner: boolean = true;
  ckupdate: boolean = false;
  showmodModal: boolean = false;
  inId: number = 0;
  modelAdd = { outlabel: '', outencryptedId: '' };
  inlabel: string = '';
  inintpaymentid: string = '';
  initArray: boolean = false;
  tippyOptions = {
    trigger: 'click',
    hideOnClick: false,
    onShow: (instance: any) => {
      setTimeout(() => {
        instance.hide();
      }, 700);
    }
  };

  constructor(
    private databaseService: DatabaseService,
    private rpcCallsService: RpcCallsService,
    private activatedRoute: ActivatedRoute
  ) { }

  async ngOnInit() {
    this.walletaddress = this.activatedRoute.snapshot.paramMap.get('waddress') ?? '';
    this.intAddresses = await this.databaseService.getIntegratedAddresses(this.walletaddress);
    if (this.intAddresses.length > 0) {
      this.initArray = true;
      await new Promise(resolve => setTimeout(resolve, 500));
      $(this.table.nativeElement).DataTable({
        lengthMenu: [5, 25, 50, 100],
        pageLength: 5
      });
      this.hidetrans = false;
      this.nointAddress = false;
    }
    this.showspinner = false;
  };

  showaddContact(): void {
    this.showaddModal = true;
  }

  async addintAddress(data: any) {
    this.showaddModal = false;
    this.showspinner = true;
    this.modelAdd = data;
    this.inlabel = this.modelAdd.outlabel;
    if (this.inlabel !== 'skip') {
      if (this.ckLabel(this.inlabel)) {
        this.showMessage("This Label already exists. Try again.");
      } else {
        this.inintpaymentid = this.modelAdd.outencryptedId;
        if (this.ckpaymentId(this.inintpaymentid)) {
          this.showMessage("This Payment Id already exists. Try again.");
        } else {
          const response: rpcReturn = await this.rpcCallsService.createIntegratedAddress(this.inintpaymentid);
          if (response.status) {
            let indata = {
              label: this.inlabel, payment_id: response.data.payment_id,
              integrated_address: response.data.integrated_address
            };
            if (await this.databaseService.saveIntegratedAddresses(indata, this.walletaddress)) {
              this.hidetrans = true;
              if (this.initArray) {
                if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
                  $(this.table.nativeElement).DataTable().destroy();
                }
                this.intAddresses = [];
                this.intAddresses.length = 0;
              }
              this.intAddresses = await this.databaseService.getIntegratedAddresses(this.walletaddress);
              if (this.intAddresses.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 500));
                $(this.table.nativeElement).DataTable({
                  lengthMenu: [5, 25, 50, 100],
                  pageLength: 5
                  });
              } else {
                this.nointAddress = true;
                this.showMessage("Error occured retrieving data from the wallet file.");
              }
              this.hidetrans = false;
            } else {
              this.showMessage("Error occured updating wallet file.");
            }
          } else {
            this.showMessage(response.message);
          }
        }
      }
    }
    this.showspinner = false;
  }

  ckLabel(inname: string): boolean {
    const foundIntAddress = this.intAddresses.find(item => item.label === inname);
    if (foundIntAddress?.label) {
      return true;
    } else {
      return false;
    }
  }

  ckpaymentId(inname: string): boolean {
    const foundIntAddress = this.intAddresses.find(item => item.paymentid === inname);
    if (foundIntAddress?.paymentid) {
      return true;
    } else {
      return false;
    }
  }

  modintAddressPick(id: number): void {
    this.inId = id;
    this.showmodModal = true;
  }

  async copyAddress(id: number) {
    await navigator.clipboard.writeText(this.intAddresses[id].address)
      .then(() => {
      })
      .catch(err => {
        this.showMessage('Failed to copy text: ' + err);
      });
  }

  showMessage(message: string): void {
    this.message = message;
  }

}