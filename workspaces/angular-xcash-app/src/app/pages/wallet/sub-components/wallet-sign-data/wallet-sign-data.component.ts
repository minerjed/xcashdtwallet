import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { ActivatedRoute } from '@angular/router';
import { faEdit, faCopy } from '@fortawesome/free-solid-svg-icons';
import { signedData } from 'src/app/models/signeddata';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { rpcReturn } from 'src/app/models/rpc-return';
declare var $: any;

@Component({
  selector: 'app-wallet-sign-data',
  templateUrl: './wallet-sign-data.component.html',
  styleUrls: ['./wallet-sign-data.component.sass']
})
export class WalletSignDataComponent implements OnInit {
  @ViewChild('signdataidid') table!: ElementRef;
  signedDataArray: signedData[] = [];
  faEdit = faEdit;
  faCopy = faCopy;
  hidetrans: boolean = true;
  modelAdd = { outdata: "" };
  noSignedData: boolean = true;
  message: string = "";
  walletaddress: string = "";
  showspinner: boolean = true;
  showSignModal = false;
  showVerifyModal = false;
  initArray: boolean = false;
  wsdata = { data: "", signature: "" };
  wsvdata = { outdata: "", outSignAddress: "", outSignature: "" };
  showDisplayModal = false;
  passData: string = '';
  passSignature: string = '';
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
    this.signedDataArray = await this.databaseService.getSignedData(this.walletaddress);
    if (this.signedDataArray.length > 0) {
      this.noSignedData = false;
      this.initArray = true;
      await new Promise(resolve => setTimeout(resolve, 500));
      $(this.table.nativeElement).DataTable({
        lengthMenu: [5, 25, 50, 100],
        pageLength: 5
      });
      this.hidetrans = false;
    } else {
      this.noSignedData = true;
    }
    this.showspinner = false;
  };

  showSign(): void {
    this.showSignModal = true;
  }

  async addSignData(data: any) {
    this.showSignModal = false;
    this.showspinner = true;
    this.modelAdd = data;
    if (this.modelAdd.outdata !== "skip") {
      this.noSignedData = true;
      const response: rpcReturn = await this.rpcCallsService.createSignedData(this.modelAdd.outdata);
      if (response.status) {
        this.wsdata.data = this.modelAdd.outdata;
        this.wsdata.signature = response.data;
        if (await this.databaseService.saveSignedData(this.wsdata, this.walletaddress)) {
          if (this.initArray) {
            if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
              $(this.table.nativeElement).DataTable().destroy();
            }
            this.signedDataArray = [];
            this.signedDataArray.length = 0;
          }
          this.signedDataArray = await this.databaseService.getSignedData(this.walletaddress);
          if (this.signedDataArray.length > 0) {
            this.hidetrans = true;
            this.noSignedData = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            $(this.table.nativeElement).DataTable({
              lengthMenu: [5, 25, 50, 100],
              pageLength: 5
            });
            this.hidetrans = false;
          } else {
            this.message = "Error reading the Wallet db file.";
          }
        } else {
          this.message = "Error updating the Wallet db file.";
        }
      } else {
        this.message = response.message;
      }
    }
    this.showspinner = false;
  }

  showVerify(): void {
    this.showVerifyModal = true;
  }

  async exitSignData(data: any) {
    this.showVerifyModal = false;
  }

  copyData(id: number): void {
    navigator.clipboard.writeText(this.signedDataArray[id].data)
      .then(() => { })
      .catch(err => {
        this.showMessage('Failed to copy text: ' + err);
      });
  }

  copySignature(id: number): void {
    navigator.clipboard.writeText(this.signedDataArray[id].signature)
      .then(() => { })
      .catch(err => {
        this.showMessage('Failed to copy text: ' + err);
      });
  }

  showMessage(message: string): void {
    this.message = message;
  }

  callDisplayModal(id: any): void {
    this.passData = this.signedDataArray[id].data;
    this.passSignature = this.signedDataArray[id].signature;
    this.showDisplayModal = true;
  }

  exitDisplayModal(): void {
    this.showDisplayModal = false;
  }

}