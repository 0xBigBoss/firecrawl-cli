import { render } from "ink";
import React from "react";

/**
 * Renders an Ink component and returns a promise that resolves when the app exits
 * Commands are expected to call app.exit() when they complete (with or without error)
 */
// biome-ignore lint/complexity/noBannedTypes: Generic component props
export async function renderComponent<P = {}>(Component: React.FC<P>, props: P): Promise<void> {
  const { waitUntilExit } = render(React.createElement(Component as React.FC<any>, props));

  // Commands will call app.exit() on success or app.exit(error) on failure
  return waitUntilExit();
}
