import { Component, OnInit, ViewChild } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { faEdit, faCopy } from '@fortawesome/free-solid-svg-icons';
import { ReserveProof } from 'src/app/models/reserveproof';
import { RpcCallsService } from 'src/app/services/rpc-calls.service';
import { DataTableDirective } from 'angular-datatables';
declare var $: any;

@Component({
  selector: 'app-wallet-reserve-proof',
  templateUrl: './wallet-reserve-proof.component.html',
  styleUrls: ['./wallet-reserve-proof.component.sass']
})
export class WalletReserveProofComponent implements OnInit {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
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

  //  inrpData = { amount: 0, message: '' }

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
      this.dtTrigger.next(this.reserveProofArray);
      await new Promise(resolve => setTimeout(resolve, 500));
      this.changePageLength(5);
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
      const inSignature = await this.rpcCallsService.createReserveproof(data);
      if (inSignature !== 'error') {
        console.log('here');
        console.log(data.amount);
        const newdata = {balance: data.amount, message: data.message, reserve_proof: inSignature};     
        if (await this.databaseService.saveReserveproof(newdata, this.walletaddress)) {
          this.hidetrans = true;
          if (this.initArray) {
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
              dtInstance.destroy();
            });
            this.reserveProofArray = [];
            this.reserveProofArray.length = 0;
          }
          this.reserveProofArray = await this.databaseService.getReserveproof(this.walletaddress);
          if (this.reserveProofArray.length > 0) {
            this.dtTrigger.next(this.reserveProofArray);
            await new Promise(resolve => setTimeout(resolve, 500));
            this.changePageLength(5);
            this.hidetrans = false;
          } else {
            this.message = "Error reading the Wallet db file.";
          }
        } else {
          this.message = "Error updating the Wallet db file.";
        }
      } else {
        this.message = "Error calling the Wallet RPC process."
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
    console.log (this.passMessage);
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