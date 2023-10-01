import { Component, OnInit } from '@angular/core';
import { WindowApiConst } from 'shared-lib';
import { WalletsListService } from '../../services/wallets-list.service';
import { BehaviorSubject } from 'rxjs';
import { Wallet } from '../../models/wallet.model';
import { faWallet, faTrashCan, faEdit } from '@fortawesome/free-solid-svg-icons';

const fs: any = window['electronFs'];
const APIs: any = window['electronAPIs'];

@Component({
	selector: 'app-wallets',
	templateUrl: './wallets-list.component.html',
	styleUrls: ['./wallets-list.component.sass']
})
export class WalletsListComponent implements OnInit {
	wdir = APIs.platform !== "win32" ? `${APIs.homeDir}/${WindowApiConst.XCASHOFFICAL}/` : (`${APIs.userProfile}\\${WindowApiConst.XCASHOFFICAL}\\`).replace(/\\/g, "\\\\");
    dbfile: string = `${this.wdir}database.txt`;
	faWallet = faWallet;
	faTrashCan = faTrashCan;
	faEdit = faEdit;
	walletList$: BehaviorSubject<Wallet[]> | undefined;
	dbjson: string = '';       // current value of database file
	wcount: number = 0;
	showDelModal: boolean = false;
	showRenameModal: boolean = false;
	showCreateModal: boolean = false;
	showImportModal: boolean = false;
	idForDel: number = 0;
	nameForDel: string = '';
	idForRename: number = 0;
	nameForRename: string = '';
	message: string = '';
	model = { id: 0, newname: "" };

	constructor(
		private walletslistService: WalletsListService
	) { }

	// Rename Wallet Modal
	selectRenameWallet(selectedid: number, selectedname: string) {
		this.idForRename = selectedid;
		this.nameForRename = selectedname;
		this.showRenameModal = true;
	}

	selectedRenameWallet(data: any) {
		this.showRenameModal = false;
		this.model = data;
		if (this.model.newname) {
			if (fs.existsSync(`${this.wdir}${this.model.newname}`)) {
				this.showMessage('The wallet name is already exists. Try again.');
			} else {
				this.walletslistService.renameWallet(this.model.id, this.model.newname);
				let dbparse: any = JSON.parse(this.dbjson);
				let old_wallet = dbparse.wallet_data[data.id].wallet_name;
				dbparse.wallet_data[data.id].wallet_name = this.model.newname;
				const upddbjson: string = JSON.stringify(dbparse);
				try {
					fs.writeFileSync(this.dbfile, upddbjson);
					try {
						fs.renameSync(`${this.wdir}${old_wallet}`, `${this.wdir}${this.model.newname}`);
						try {
							fs.renameSync(`${this.wdir}${old_wallet}.keys`, `${this.wdir}${this.model.newname}.keys`);
							this.dbjson = upddbjson;
						} catch (err: any) {
							this.showMessage('Error renaming wallet keys file. ' + err.code);
						}
					} catch (err: any) {
						this.showMessage('Error renaming wallet file. ' + err.code);
					}
				} catch (err: any) {
					this.showMessage('Error reading wallet db file. ' + err.code);
				}
			}
		}
	}

	selectDelWallet(selectedid: number, selectedname: string) {
		this.idForDel = selectedid;
		this.nameForDel = selectedname;
		this.showDelModal = true;
	}

	selectedDelWallet(idConfirmed: number) {
// 	renameSync: fs.renameSync

		this.showDelModal = false;
		if (idConfirmed) {
			this.walletslistService.removeWallet(idConfirmed);
			let dbparse: any = JSON.parse(this.dbjson);
			let wallet_name: string = dbparse.wallet_data[idConfirmed].wallet_name;
			dbparse.wallet_data.splice(idConfirmed, 1);
			const upddbjson: string = JSON.stringify(dbparse);
			try {
				fs.writeFileSync(this.dbfile, upddbjson);
				try {

					fs.renameSync(`${this.wdir}${wallet_name}`, `${this.wdir}${wallet_name}-Deleted`);
					try {
						fs.renameSync(`${this.wdir}${wallet_name}.keys`, `${this.wdir}${wallet_name}.keys-Deleted`);
						this.dbjson = upddbjson;
						this.wcount = JSON.parse(this.dbjson).wallet_data.length;
					} catch (err: any) {
						this.showMessage('Error deleting wallet keys file. ' + err.code);
					}
				} catch (err: any) {
					this.showMessage('Error deleting wallet file. ' + err.code);
				}
			} catch (err: any) {
				this.showMessage('Error updating wallet db file. ' + err.code);
			}
		}
	}

	showMessage(message: string): void {
		this.message = message;
	}

	ngOnInit(): void {
		// read Wallet Data.
		try {
			const dbstring: string = fs.readFileSync(this.dbfile, 'utf8');
			this.dbjson = dbstring;
			this.walletslistService.loadWallets(dbstring);
			this.wcount = JSON.parse(dbstring).wallet_data.length;
			this.walletList$ = this.walletslistService.getWalletList();
		} catch (err: any) {
			this.dbjson = '{"wallet_data": [],"contact_data": [],"wallet_settings": {"autolock": 10,"remote_node": "seed1.xcash.tech:18281"}}';
			this.wcount = 0;
			this.walletslistService.loadWallets(this.dbjson);
			this.showMessage('Error occured reading wallet db file.  It should be automically created on startup.');
		}
	}

	createWallet(): void {
		this.showCreateModal = true;
	}

	exitCreateModal(): void {
		this.showCreateModal = false;
	}

	importWallet(): void {
		this.showImportModal = true;
	}

	exitImportModal(): void {
		this.showImportModal = false;
	}

}