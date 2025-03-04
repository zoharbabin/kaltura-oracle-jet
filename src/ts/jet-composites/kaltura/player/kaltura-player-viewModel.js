define(['knockout', 'jquery'], function(ko, $) {

  // Enum definitions for player modes and event types
  const PlayerMode = Object.freeze({
    REGULAR: 'regular',
    INTERACTIVE: 'interactive'
  });

  const PlayerEventType = Object.freeze({
    LOADED: 'loaded',
    ERROR: 'error'
  });

  /**
   * Helper function to securely load external scripts.
   * Temporarily disables AMD detection to avoid conflicts.
   *
   * @param {string} url - The URL of the script to load.
   * @returns {Promise} - Resolves when the script is loaded.
   */
  function loadExternalScript(url) {
    return new Promise((resolve, reject) => {
      let originalAmd;
      if (window.define && window.define.amd) {
        originalAmd = window.define.amd;
        window.define.amd = undefined;
      }
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.onload = () => {
        if (originalAmd) {
          window.define.amd = originalAmd;
        }
        resolve();
      };
      script.onerror = () => {
        if (originalAmd) {
          window.define.amd = originalAmd;
        }
        reject(new Error(`Failed to load script: ${url}`));
      };
      document.body.appendChild(script);
    });
  }

  /**
   * Oracle JET ViewModel for the Kaltura Player Component.
   *
   * @param {Object} context - Oracle JET component context.
   */
  function KalturaPlayerViewModel(context) {
    const self = this;

    // Unique container ID for this component instance.
    self.containerId = `kaltura_player_comp_${context.unique}`;

    // Component configuration from metadata.
    // Note: The top-level properties (domain, mediaId, mode) are used to build the external script URL,
    // while the nested objects (playback, provider, log, rapt) are used in the player configuration.
    console.log('context.properties.rapt.showScrubber', context.properties.rapt.showScrubber);
    const config = {
      domain: context.properties.domain,
      partnerId: context.properties.partnerId,
      uiConfId: context.properties.uiConfId,
      mediaId: context.properties.mediaId,
      mode: context.properties.mode || PlayerMode.REGULAR,
      playback: context.properties.playback,
      provider: context.properties.provider,
      log: context.properties.log,
      rapt: context.properties.rapt
    };

    // Player instance reference.
    self.player = null;

    /**
     * Dispatches Oracle JET custom events.
     *
     * @param {string} eventName - Name of the event to dispatch.
     * @param {Object} detail - Payload for the event.
     */
    self.dispatchJetEvent = (eventName, detail) => {
      context.element.dispatchEvent(new CustomEvent(eventName, {
        bubbles: true,
        composed: true,
        detail: detail
      }));
    };

    /**
     * Dispatches player events using the standard 'playerEvent' event.
     * The event detail includes a "type" field (either "loaded" or "error").
     *
     * @param {string} eventType - The type of the event (from PlayerEventType).
     * @param {Object} detail - Additional details for the event.
     */
    self.dispatchPlayerEvent = (eventType, detail) => {
      detail = detail || {};
      detail.type = eventType;
      self.dispatchJetEvent('playerEvent', detail);
    };

    /**
     * Returns the player configuration based on the current mode.
     *
     * @param {string} mode - Player mode (PlayerMode.REGULAR or PlayerMode.INTERACTIVE).
     * @returns {Object} - The player configuration object.
     */
    self.getPlayerConfig = (mode) => {
      // Use exposed configurations from component properties.
      const baseConfig = {
        targetId: self.containerId,
        playback: config.playback,
        provider: config.provider,
        log: config.log
      };

      if (mode === PlayerMode.INTERACTIVE) {
        return { ...baseConfig, rapt: config.rapt };
      }
      return baseConfig;
    };

    /**
     * Initializes the Kaltura Player with the configuration.
     */
    self.initPlayer = () => {
      // Build the script URL from configurable properties.
      const scriptUrl = `https://${config.domain}/p/${config.partnerId}/embedPlaykitJs/uiconf_id/${config.uiConfId}`;
      loadExternalScript(scriptUrl)
        .then(() => {
          const KalturaPlayer = window.KalturaPlayer;
          const PathKalturaPlayer = window.PathKalturaPlayer;
          const playerConfig = self.getPlayerConfig(config.mode);

          // Clear the player container (useful for reinitialization).
          $(`#${self.containerId}`).empty();

          if (config.mode === PlayerMode.REGULAR) {
            self.player = KalturaPlayer.setup(playerConfig);
            self.player.loadMedia({ entryId: config.mediaId })
              .then(() => {
                self.dispatchPlayerEvent(PlayerEventType.LOADED, { player: self.player, mode: config.mode });
                context.element.kalturaPlayer = self.player;
              })
              .catch((err) => {
                self.dispatchPlayerEvent(PlayerEventType.ERROR, { error: err, mode: config.mode });
              });

          } else if (config.mode === PlayerMode.INTERACTIVE) {
            if (!PathKalturaPlayer) {
              self.dispatchPlayerEvent(PlayerEventType.ERROR, {
                error: new Error('Interactive mode requires PathKalturaPlayer.'),
                mode: config.mode
              });
              return;
            }
            try {
              self.player = PathKalturaPlayer.setup(playerConfig);
              self.player.addListener('project:ready', (event) => {
                self.dispatchPlayerEvent(PlayerEventType.LOADED, { player: self.player, mode: config.mode, event: event });
                context.element.kalturaPlayer = self.player;
              });
              self.player.loadMedia({ playlistId: config.mediaId });
            } catch (err) {
              self.dispatchPlayerEvent(PlayerEventType.ERROR, { error: err, mode: config.mode });
            }
          }
        })
        .catch((scriptErr) => {
          self.dispatchPlayerEvent(PlayerEventType.ERROR, { error: scriptErr, mode: config.mode });
        });
    };

    /**
     * Oracle JET lifecycle method - called when the component is attached to the DOM.
     */
    self.connected = () => {
      self.initPlayer();
    };

    /**
     * Oracle JET lifecycle method - called when component properties are updated.
     */
    self.updated = () => {
      self.initPlayer();
    };
  }

  return KalturaPlayerViewModel;
});
