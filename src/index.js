import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import hypernova, { serialize, load } from 'hypernova';

function renderToString(component, props) {
  return ReactDOMServer.renderToString(React.createElement(component, props));
}

export const renderReact = (name, component, config) => hypernova({
  server() {
    return (props) => {
      const markup = renderToString(component, props);

      if (!config.serialize) {
        return serialize(name, markup, props);
      } else {
        return config.serialize(markup, (html) => (
          serialize(name, html, props)
        ));
      }
    };
  },

  client() {
    const payloads = load(name);

    if (payloads) {
      payloads.forEach((payload) => {
        const { node, data } = payload;
        const element = React.createElement(component, data);
        ReactDOM.hydrate(element, node);
      });
    }

    return component;
  },
});

export const renderReactStatic = (name, component) => hypernova({
  server() {
    return props => ReactDOMServer.renderToStaticMarkup(React.createElement(component, props));
  },

  client() {},
});
