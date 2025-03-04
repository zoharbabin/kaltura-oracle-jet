define([
  'ojs/ojcomposite',
  'text!./component.json',
  'text!./kaltura-player-view.html',
  './kaltura-player-viewModel',
  'css!./kaltura-player-styles'
], function(Composite, metadata, view, viewModel) {
  Composite.register('kaltura-player', {
    view: view,
    viewModel: viewModel,
    metadata: JSON.parse(metadata)
  });
});
