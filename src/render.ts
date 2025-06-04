import { render } from "ink";
import React from "react";

/**
 * Renders an Ink component and returns a promise that resolves when the app unmounts
 */
// biome-ignore lint/complexity/noBannedTypes: Generic component props
export async function renderComponent<P = {}>(Component: React.FC<P>, props: P): Promise<void> {
  return new Promise((resolve, reject) => {
    const { unmount, waitUntilExit } = render(
      React.createElement(Component as React.FC<any>, props),
    );

    waitUntilExit()
      .then(() => resolve())
      .catch((error) => {
        unmount();
        reject(error);
      });
  });
}
