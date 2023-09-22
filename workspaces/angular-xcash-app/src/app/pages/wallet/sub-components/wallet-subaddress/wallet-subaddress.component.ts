import { Component, OnInit, ViewChild } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { faEdit, faCopy } from '@fortawesome/free-solid-svg-icons';
import { SubAddress } from 'src/app/models/subaddress';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { DataTableDirective } from 'angular-datatables';
declare var $: any;

@Component({
  selector: 'app-wallet-subaddress ',
  templateUrl: './wallet-subaddress.component.html',
  styleUrls: ['./wallet-subaddress.component.sass']
})
export class WalletSubaddressComponent implements OnInit {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  subAddresses: SubAddress[] = [];
  faEdit = faEdit;
  faCopy = faCopy;
  hidetrans: boolean = true;
  showaddModal: boolean = false;
  modelAdd = { outlabel: "" };
  noSubaddress: boolean = true;
  message: string = "";
  subcount: any = 0;
  walletaddress: string = "";
  newcount: any = "";
  inlabel: string = "";
  showspinner: boolean = true;
  ckupdate: boolean = false;
  showmodModal: boolean = false;
  inId: number = 0;
  inLab: string = "";
  modelMod = { outId: 0, newLabel: "" };
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
    this.subcount = await this.databaseService.getSubAddressCount(this.walletaddress);
    if (this.subcount > 0) {
      this.noSubaddress = false;
      this.subAddresses = await this.rpcCallsService.getSubAddresses(this.subcount);
      if (this.subAddresses.length > 0) {
        this.initArray = true;
        this.dtTrigger.next(this.subAddresses);
        await new Promise(resolve => setTimeout(resolve, 500));
        this.changePageLength(5);
        this.hidetrans = false;
      } else {
        this.showMessage("Error occured retrieving Sub Accounts.");
      }
    } else {
      this.noSubaddress = true;
    }
    this.showspinner = false;
  };

  showaddContact(): void {
    this.showaddModal = true;
  }

  async addsubAddress(data: any) {
    this.showspinner = true;
    this.showaddModal = false;
    this.modelAdd = data;
    this.inlabel = this.modelAdd.outlabel;
    if (this.inlabel !== 'skip') {
      const { newaddress, addressIndex } = await this.rpcCallsService.createSubAddress(this.inlabel);
      if (newaddress === "failure") {
        this.showMessage("Error occured creating sub address.")
      } else {
        // The index of the address created is returned so use it to update the dbfile
        this.ckupdate = await this.databaseService.updateSubAddressCount(this.walletaddress, addressIndex);
        if (this.ckupdate) {
          this.hidetrans = true;
          if (this.initArray) {
            this.initArray = true;
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
              dtInstance.destroy();
            });
            this.subAddresses = [];
            this.subAddresses.length = 0;
          }
          this.subAddresses = await this.rpcCallsService.getSubAddresses(addressIndex);
          if (this.subAddresses.length > 0) {
            this.dtTrigger.next(this.subAddresses)
          } else {
            this.noSubaddress = true;
          }
          await new Promise(resolve => setTimeout(resolve, 500));
          this.changePageLength(5);
          this.hidetrans = false;
        } else {
          this.showMessage("Error occured updating wallet file.");
        }
      }
    }
    this.showspinner = false;
  }

  modSubaddressPick(id: number): void {
    this.inId = id;
    this.inLab = this.subAddresses[id-1].label;
    this.showmodModal = true;
  }

  async modsubAddress(data: any) {
    this.showmodModal = false;
    this.showspinner = true;
    this.modelMod = data;
    if (this.modelMod.outId !== 0) {
      const ckupdate = await this.rpcCallsService.updateaddressLabel(this.modelMod.outId, this.modelMod.newLabel);
      if (ckupdate) {
        this.hidetrans = true;
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
        const addressIndex = this.subAddresses.length;
        this.subAddresses = [];
        this.subAddresses.length = 0;
        this.subAddresses = await this.rpcCallsService.getSubAddresses(addressIndex);
        if (this.subAddresses.length > 0) {
          this.dtTrigger.next(this.subAddresses)
        } else {
          this.noSubaddress = true;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        this.changePageLength(5);
        this.hidetrans = false;
      } else {
        this.showMessage("RPC Error occured updating subaddress label.");
      }
    }
    this.showspinner = false;
  }

  copyAddress(id: number): void {
    navigator.clipboard.writeText(this.subAddresses[id].address)
      .then(() => { })
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