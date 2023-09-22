import { Component, OnInit, ViewChild } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { faEdit, faCopy } from '@fortawesome/free-solid-svg-icons';
import { integratedAddress } from 'src/app/models/integratedaddress'
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { DataTableDirective } from 'angular-datatables';
declare var $: any;

@Component({
  selector: 'app-wallet-integrated-address',
  templateUrl: './wallet-integrated-address.component.html',
  styleUrls: ['./wallet-integrated-address.component.sass']
})
export class WalletIntegratedAddressComponent implements OnInit {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
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
      this.dtTrigger.next(this.intAddresses);
      await new Promise(resolve => setTimeout(resolve, 500));
      this.changePageLength(5);
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
          const iadata: any = await this.rpcCallsService.createIntegratedAddress(this.inintpaymentid);
          if (iadata.status) {
            let indata = { label: this.inlabel, payment_id: iadata.payment_id, integrated_address: iadata.integrated_address };
            if (await this.databaseService.saveIntegratedAddresses(indata, this.walletaddress)) {
              this.hidetrans = true;
              if (this.initArray) {
                this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                  dtInstance.destroy();
                });
                this.intAddresses = [];
                this.intAddresses.length = 0;
              }
              this.intAddresses = await this.databaseService.getIntegratedAddresses(this.walletaddress);
              if (this.intAddresses.length > 0) {
                this.dtTrigger.next(this.intAddresses);
              } else {
                this.nointAddress = true;
                this.showMessage("Error occured retrieving data from the wallet file.");
              }
              await new Promise(resolve => setTimeout(resolve, 500));
              this.changePageLength(5);
              this.hidetrans = false;
            } else {
              this.showMessage("Error occured updating wallet file.");
            }
          } else {
            this.showMessage("Error calling the Wallet RPC process.");
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

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  changePageLength(newLength: number): void {
    // I think a bug in angular-datatable is preventing the setting of dtoptions so created this workaround for now
    const dtInstance = this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page.len(newLength).draw();
    });
    $('div.dataTables_length').find('select, label').remove();
    var newDropdown = $('<select></select>');
    newDropdown.append('<option value="5">5</option>');
    newDropdown.append('<option value="10">10</option>');
    newDropdown.append('<option value="25">25</option>');
    newDropdown.append('<option value="50">50</option>');
    newDropdown.append('<option value="100">100</option>');
    $('div.dataTables_length').append(newDropdown);
    var table = $('#myTable').DataTable();
    $('div.dataTables_length').append('<label>Show </label>').append(newDropdown).append(' entries');
    newDropdown.on('change', () => {
      this.dtElement?.dtInstance.then((dtInstance: DataTables.Api) => {
        const val = newDropdown.val();
        if (typeof val === 'number' || (typeof val === 'string' && !isNaN(+val))) {
          dtInstance.page.len(+val).draw();
        }
      });
    });
  }

}