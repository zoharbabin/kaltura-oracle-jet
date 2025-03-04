# OracleJET Kaltura Player Component Example

This repository demonstrates how to embed the Kaltura Player as a custom OracleJET composite component. It shows an end-to-end example of integrating the Kaltura Player into an OracleJET application using RequireJS for module loading and preact for JSX support. The example covers component registration, dynamic external script loading, custom event handling, and integration with OracleJET views and routing.

---

## Table of Contents

- [Overview](#overview)
- [Kaltura Component Implementation](#kaltura-component-implementation)
  - [Component Metadata (`component.json`)](#component-metadata-componentjson)
  - [ViewModel (`kaltura-player-viewModel.js`)](#viewmodel-kaltura-playerviewmodeljs)
  - [View (`kaltura-player-view.html`)](#view-kaltura-playerviewhtml)
  - [Loader (`loader.js`)](#loader-loaderjs)
- [Dynamic Script Loading and AMD/RequireJS Compatibility](#dynamic-script-loading-and-amdrequirejs-compatibility)
- [Component Usage and Integration](#component-usage-and-integration)
  - [Global Registration (`root.ts`)](#global-registration-rootts)
  - [Embedding in Views (`dashboard.html`)](#embedding-in-views-dashboardhtml)
  - [Event Handling and Extensions (`dashboard.ts`)](#event-handling-and-extensions-dashboardts)
- [Extending the Component](#extending-the-component)
- [Setup and Running the Example](#setup-and-running-the-example)
- [License](#license)

---

## Overview

This project serves as a practical example for integrating the [Kaltura Player](https://corp.kaltura.com/) into an OracleJET application. It wraps the Kaltura Player in a custom OracleJET composite component, allowing developers to easily embed and control the player through OracleJET’s declarative and MVVM-based architecture. The component handles dynamic script loading, initialization in both "regular" and "interactive" modes, and dispatches custom events that other parts of the application can listen to.

---

## Kaltura Component Implementation

The Kaltura Player component is implemented as an OracleJET composite. All related files are located in the `/src/ts/jet-composites/kaltura/player` directory.

### Component Metadata (`component.json`)

- **Purpose:** Defines the component’s metadata, properties, default values, and events.
- **Key Properties:**
  - `domain`, `partnerId`, `uiConfId`, `mediaId`: Used to build the Kaltura Player script URL and configure the player.
  - `mode`: Determines whether the player operates in `regular` or `interactive` mode.
  - Nested properties (`playback`, `provider`, `log`, `rapt`): Provide additional configuration options.
- **Events:** The component dispatches a `playerEvent` to signal when the player is loaded or if an error occurs.

### ViewModel (`kaltura-player-viewModel.js`)

- **Component Initialization:**
  - **Unique Container:** Each instance gets a unique container ID (using `context.unique`) to ensure proper rendering.
  - **Configuration Extraction:** Reads component properties from `context.properties` to form a configuration object.
- **Dynamic Script Loading:**
  - Uses a helper function `loadExternalScript(url)` to inject the external Kaltura Player script into the document.
  - **AMD Compatibility:** Temporarily disables AMD detection (by setting `window.define.amd` to `undefined`) to avoid conflicts with RequireJS and preact during the script load, then restores it.
- **Player Setup:**
  - Constructs the script URL using the `domain`, `partnerId`, and `uiConfId` properties.
  - Depending on the `mode`:
    - **Regular Mode:** Calls `window.KalturaPlayer.setup(...)` and loads media using `loadMedia({ entryId: ... })`.
    - **Interactive Mode:** Uses `window.PathKalturaPlayer.setup(...)`, adds a listener for a `project:ready` event, and loads media using `loadMedia({ playlistId: ... })`.
- **Event Dispatching:**
  - Custom events (`playerEvent`) are dispatched to notify when the player has successfully loaded or encountered an error.
- **Lifecycle Methods:**
  - The `connected()` and `updated()` methods call `initPlayer()` to initialize or reinitialize the player when the component is attached or its properties change.

### View (`kaltura-player-view.html`)

- **Structure:** A minimal template containing a single `<div>` element.
- **Binding:** The `id` of the `<div>` is bound to the unique container ID generated in the ViewModel, ensuring that each instance renders its player in a separate container.

### Loader (`loader.js`)

- **Purpose:** Registers the Kaltura Player as an OracleJET composite component.
- **Mechanism:** Uses OracleJET’s `Composite.register` API to bind the view, ViewModel, and metadata together.
- **Additional Assets:** Loads a CSS file (`kaltura-player-styles`) to style the component.

---

## Dynamic Script Loading and AMD/RequireJS Compatibility

One of the key challenges in integrating third-party scripts in a RequireJS environment is avoiding module collisions. The Kaltura Player component addresses this by:

1. **Disabling AMD Detection:**
   - Before loading the external Kaltura script, the component temporarily disables AMD support by setting `window.define.amd` to `undefined`. This prevents the external script from being interpreted as an AMD module.
2. **Restoring AMD:**
   - Once the script is loaded, the original AMD setting is restored, ensuring that RequireJS and other modules (such as preact) continue to function without conflicts.
3. **Dynamic Loading:** 
   - The `loadExternalScript` function handles script injection and error management, ensuring a smooth asynchronous load process.

---

## Component Usage and Integration

### Global Registration (`root.ts`)

- **Loading the Component:**
  - The composite loader (`jet-composites/kaltura/player/loader`) is imported in `root.ts`. This registration makes the `<kaltura-player>` custom element available throughout the application.
- **OracleJET Bootstrap:**
  - After registration, the OracleJET binding (`ko.applyBindings`) is applied to the global DOM, making the component ready for use.

### Embedding in Views (`dashboard.html`)

- **HTML Markup:**
  - Two instances of the `<kaltura-player>` component are embedded in the dashboard view:
    - One configured for `regular` mode.
    - One configured for `interactive` mode.
- **Attribute Configuration:**
  - Attributes such as `domain`, `partner-id`, `ui-conf-id`, `media-id`, and `mode` are set directly in the HTML to pass configuration options to the component.

### Event Handling and Extensions (`dashboard.ts`)

- **Custom Event Integration:**
  - In `dashboard.ts`, the Dashboard ViewModel queries for all `<kaltura-player>` elements and attaches an event listener for the custom `playerEvent`.
  - **Event Types:** The event detail indicates whether the player has successfully loaded (`loaded`) or encountered an error (`error`).
- **Extended Player Event Handling:**
  - Once a player is loaded (detected via the `loaded` event), additional listeners may be attached to the player instance to handle events such as `timeupdate` or custom interactive events.
- **Lifecycle Management:**
  - The Dashboard ViewModel adds event listeners in the `connected()` method and cleans them up in the `disconnected()` method.

---

## Extending the Component

Developers can extend or customize the Kaltura Player component in several ways:

- **Modify Component Properties:**  
  Update default values or add new configuration options in `component.json`.

- **Enhance the ViewModel:**
  - Add new methods or event handlers.
  - Integrate further with the Kaltura API by leveraging additional events or player methods.
  
- **Style Customization:**
  - Adjust or override styles in the associated CSS file (`kaltura-player-styles`) to match the application’s design.

- **Event Extensions:**
  - The component dispatches a standard `playerEvent`. Consumers can extend this mechanism to support additional custom events or integration scenarios.

---

## Setup and Running the Example

1. **Install Dependencies:**  
   Run `npm install` to install OracleJET, RequireJS, preact, and other dependencies as defined in the project.

2. **Build the Application:**  
   Use the OracleJET CLI or your preferred build tool to compile the TypeScript files and bundle the application.

3. **Serve the Application:**  
   Start the local development server (e.g., using `ojet serve`) and navigate to the dashboard view to see the Kaltura Players in action.

4. **Debugging:**  
   Check the browser console for log messages from the component’s lifecycle methods and custom event dispatches.

---

## License

The Kaltura Component Code (under [`/src/ts/jet-composites/kaltura/player`](./src/ts/jet-composites/kaltura/player)) is licensed under the [MIT License](https://opensource.org/licenses/MIT).  
The rest is the default Oracle JET Exmaple Project that you get when executing `❯ npx @oracle/ojet-cli create JET_Web_Application --template=navdrawer --typescript`


---

By following this example, developers can leverage OracleJET’s composite architecture to integrate third-party media players like Kaltura in a modular, event-driven, and maintainable way.
