const React = require('react');

// Simple mock component for icon libraries used in tests
function Icon(props) {
  const { name, size, color, ...rest } = props || {};
  return React.createElement('Text', { 'data-testid': `icon-${name}`, ...rest }, name || 'icon');
}

module.exports = {
  Ionicons: Icon,
  default: {
    Ionicons: Icon,
  },
};
