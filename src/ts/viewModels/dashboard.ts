/**
 * @license
 * Copyright (c) 2014, 2025, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
import * as AccUtils from "../accUtils";

class DashboardViewModel {

  constructor() {
    // Optionally, you can attach event listeners here if you're not using declarative binding.
  }

  connected(): void {
    AccUtils.announce("Dashboard page loaded.");
    document.title = "Dashboard";
    const comps = document.querySelectorAll('kaltura-player');
    console.log('Found players:', comps);
    if (comps && comps.length > 0) {
      comps.forEach((comp) => {
        comp.addEventListener('playerEvent', (event: Event) => this.handlePlayerEvent(event as CustomEvent));
      });
    }
    // Additional logic if needed
  }

  disconnected(): void {
    // Clean-up logic if needed
    const comps = document.querySelectorAll('kaltura-player');
    console.log('Removing event listeners from players:', comps);
    if (comps && comps.length > 0) {
      comps.forEach((comp) => {
        comp.removeEventListener('playerEvent', (event: Event) => this.handlePlayerEvent(event as CustomEvent));
      });
    }
  }

  transitionCompleted(): void {
    // Additional logic if needed
  }

  private handleInteractivePlayerEvent(event:Event): void {
    console.log('Interactive Player Event:', event);
  }

  private handleRegularPlayerEvent(event:Event): void {
    console.log('Regular Player Event:', event);
  }

  public handlePlayerEvent(event: CustomEvent): void {
    if (event.detail.type === 'loaded') {
      this.handlePlayerLoaded(event);
    } else if (event.detail.type === 'error') {
      this.handlePlayerError(event);
    }
  }

  // This method will be called when the kaltura-player-interactive component dispatches a 'player-loaded' event.
  public handlePlayerLoaded(event: CustomEvent): void {
    console.log("Player loaded event received:", event.detail);  
    // You can access event.detail.player, event.detail.mode, etc.
    var plr = event.detail.player;
    if (event.detail.mode === 'interactive') {
      const allEvents = [
        "hotspot:click",
        "node:enter",
        "node:ended",
        "node:exit",
        "project:load",
        "project:ready",
        "buffer:prebuffer",
        "buffer:bufferend",
        "buffer:bufferstart",
        "buffer:allbuffered",
        "project:start",
      ];
      for (var i = 0; i < allEvents.length; i++) {
        console.log('Adding interactive listener for event:', allEvents[i]);
        plr.addListener(allEvents[i], (event: Event) => this.handleInteractivePlayerEvent(event));
      }
    } else {
      console.log('Adding regular listener for event: timeupdate');
        plr.addEventListener('timeupdate', (event: Event) => this.handleRegularPlayerEvent(event));
    }
  }

  // This method will be called when the component dispatches a 'player-error' event.
  public handlePlayerError(event: CustomEvent): void {
    console.error("Player error event received:", event.detail);
    // Additional error handling if needed.
  }
}

export = DashboardViewModel;
