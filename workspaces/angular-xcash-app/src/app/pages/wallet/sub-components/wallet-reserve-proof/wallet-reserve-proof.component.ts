import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { ActivatedRoute } from '@angular/router';
import { faEdit, faCopy } from '@fortawesome/free-solid-svg-icons';
import { ReserveProof } from 'src/app/models/reserveproof';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { rpcReturn } from 'src/app/models/rpc-return';
declare var $: any;

@Component({
  selector: 'app-wallet-reserve-proof',
  templateUrl: './wallet-reserve-proof.component.html',
  styleUrls: ['./wallet-reserve-proof.component.sass']
})
export class WalletReserveProofComponent implements OnInit {
  @ViewChild('walreserveprid') table!: ElementRef;
  reserveProofArray: ReserveProof[] = [];
  faEdit = faEdit;
  faCopy = faCopy;
  hidetrans: boolean = true;
  noreserveProof: boolean = true;
  message: string = "";
  walletaddress: string = "";
  showspinner: boolean = true;
  showAddModal = false;
  showVerifyModal = false;
  initArray: boolean = false;
  createdSignature: string = "";
  showDisplayModal: boolean = false;
  passSignature: string = "";
  passMessage: string = "";
  passAmount: any = "";
  passStatus: string = "";
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
    this.reserveProofArray = await this.databaseService.getReserveproof(this.walletaddress);
    if (this.reserveProofArray.length > 0) {
      this.noreserveProof = false;
      this.initArray = true;
      await new Promise(resolve => setTimeout(resolve, 500));
      $(this.table.nativeElement).DataTable({
        lengthMenu: [5, 25, 50, 100],
        pageLength: 5
      });
      this.hidetrans = false;
    } else {
      this.noreserveProof = true;
    }
    this.showspinner = false;
  };

  showCreate(): void {
    this.showAddModal = true;
  }

  async addreserveProof(data: any) {
    this.showAddModal = false;
    this.showspinner = true;
    if (data.amount !== 0) {
      const response: rpcReturn = await this.rpcCallsService.createReserveproof(data);
      if (response.status) {
        const newdata = { balance: data.amount, message: data.message, reserve_proof: response.data };
        if (await this.databaseService.saveReserveproof(newdata, this.walletaddress)) {
          this.hidetrans = true;
          if (this.initArray) {
            if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
              $(this.table.nativeElement).DataTable().destroy();
            }
            this.reserveProofArray = [];
            this.reserveProofArray.length = 0;
          }
          this.reserveProofArray = await this.databaseService.getReserveproof(this.walletaddress);
          if (this.reserveProofArray.length > 0) {
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

  copyAddress(id: number): void {
    navigator.clipboard.writeText(this.reserveProofArray[id].signature)
      .then(() => { })
      .catch(err => {
        this.showMessage('Failed to copy text: ' + err);
      });
  }

  callDisplayModal(id: any): void {
    this.passMessage = this.reserveProofArray[id].message;
    this.passSignature = this.reserveProofArray[id].signature;
    this.passAmount = this.reserveProofArray[id].amount;
    this.passStatus = this.reserveProofArray[id].status;
    this.showDisplayModal = true;
  }

  exitDisplayModal(): void {
    this.showDisplayModal = false;
  }

  showMessage(message: string): void {
    this.message = message;
  }

}