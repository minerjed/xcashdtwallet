import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { ActivatedRoute } from '@angular/router';
import { faEdit, faCopy } from '@fortawesome/free-solid-svg-icons';
import { SubAddress } from 'src/app/models/subaddress';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { rpcReturn } from 'src/app/models/rpc-return';
declare var $: any;

@Component({
  selector: 'app-wallet-subaddress ',
  templateUrl: './wallet-subaddress.component.html',
  styleUrls: ['./wallet-subaddress.component.sass']
})
export class WalletSubaddressComponent implements OnInit {
  @ViewChild('subaddid') table!: ElementRef;
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
      const response: rpcReturn = await this.rpcCallsService.getSubAddresses(this.subcount);
      if (response.status) {
        this.subAddresses = response.data;
        if (this.subAddresses.length > 0) {
          this.initArray = true;
          await new Promise(resolve => setTimeout(resolve, 500));
          $(this.table.nativeElement).DataTable({
            lengthMenu: [5, 25, 50, 100],
            pageLength: 5
          });
          this.hidetrans = false;
        } else {
          this.noSubaddress = true;
        }
      } else {
        this.message = response.message;
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
      const response: rpcReturn = await this.rpcCallsService.createSubAddress(this.inlabel);
      if (!response.status) {
        this.showMessage(response.message)
      } else {
        // The index of the address created is returned so use it to update the dbfile
        this.ckupdate = await this.databaseService.updateSubAddressCount(this.walletaddress, response.data.addressIndex);
        const addressIndex = response.data.addressIndex;
        if (this.ckupdate) {
          this.hidetrans = true;
          if (this.initArray) {
            this.initArray = true;
            if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
              $(this.table.nativeElement).DataTable().destroy();
            }
            this.subAddresses = [];
            this.subAddresses.length = 0;
          }
          const response: rpcReturn = await this.rpcCallsService.getSubAddresses(addressIndex);
          if (response.status) {
            this.subAddresses = response.data;
            if (this.subAddresses.length > 0) {
              await new Promise(resolve => setTimeout(resolve, 500));
              $(this.table.nativeElement).DataTable({
                lengthMenu: [5, 25, 50, 100],
                pageLength: 5
              });
            } else {
              this.noSubaddress = true;
            }
            this.hidetrans = false;
          } else {
            this.showMessage(response.message);
          }
        }
      }
    }
    this.showspinner = false;
  }

  modSubaddressPick(id: number): void {
    this.inId = id;
    this.inLab = this.subAddresses[id - 1].label;
    this.showmodModal = true;
  }

  async modsubAddress(data: any) {
    this.showmodModal = false;
    this.showspinner = true;
    this.modelMod = data;
    if (this.modelMod.outId !== 0) {
      const response: rpcReturn = await this.rpcCallsService.updateaddressLabel(this.modelMod.outId, this.modelMod.newLabel);
      if (response.status) {
        this.hidetrans = true;
        if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
          $(this.table.nativeElement).DataTable().destroy();
        }
        const addressIndex = this.subAddresses.length;
        this.subAddresses = [];
        this.subAddresses.length = 0;
        const response: rpcReturn = await this.rpcCallsService.getSubAddresses(addressIndex);
        if (response.status) {
          this.subAddresses = response.data;
          if (this.subAddresses.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
            $(this.table.nativeElement).DataTable({
              lengthMenu: [5, 25, 50, 100],
              pageLength: 5
            });
          } else {
            this.noSubaddress = true;
          }
          this.hidetrans = false;
        } else {
          this.showMessage(response.message);
        }
      } else {
        this.showMessage(response.message);
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

}