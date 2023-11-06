import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit, OnDestroy {

  constructor(private settingsService: SettingsService) { };

  title = 'xcashdtwallet';
  private inactivityTimeout: any;
  private inactivityDelay: number = 0;
  infoMessage: string = '';

  public async ngOnInit(): Promise<void> {
    this.showInfoMessage();
    const activityTimer = await this.settingsService.getAutoLock();
    if (activityTimer !== 0) {
      this.resetInactivityTimeout();
      // Application will shutdown after inactivity timer expires
      this.inactivityDelay = activityTimer * 60 * 1000;
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.inactivityTimeout);
  }

  @HostListener('window:mousemove')
  @HostListener('window:keydown')
  @HostListener('window:wheel')
  onUserActivity(): void {
    this.resetInactivityTimeout();
  }

  private async resetInactivityTimeout() {
    while (this.inactivityDelay < 1) {
      // Wait for a short time before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    clearTimeout(this.inactivityTimeout);
    this.inactivityTimeout = setTimeout(() => {
      this.gracefulShutdown();
    }, this.inactivityDelay);
  }

  private gracefulShutdown(): void {
    (window as any).electronAPI.send('graceful-shutdown');
  }

  async showInfoMessage() {
    this.infoMessage = 'If you have not opened your wallet recently, the first wallet transactions could take a while the wallet synchronizes. Thank you for your patience.';
    await new Promise(resolve => setTimeout(resolve, 5000)); // Set the timer to expire after 5 seconds
    this.infoMessage = '';
  }
}