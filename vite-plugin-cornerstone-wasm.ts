import type { Plugin } from 'vite';

const VIRTUAL_MODULE_ID = 'virtual:cornerstone-wasm-config';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

export interface VitePluginCornerstoneWasmOptions {
  /**
   * Base path (or URL prefix) for loading WASM binaries.
   * When set, this is passed to Cornerstone's config so WASM URLs are resolved
   * correctly when the app is served under a subpath (e.g. base '/subpath/').
   * If not set, the plugin does not inject a base path (app can use setConfiguration({ wasmBasePath: import.meta.env.BASE_URL }) instead).
   */
  wasmBasePath?: string;
}

/**
 * Vite plugin that allows replacing the WASM loading path used by Cornerstone
 * (e.g. @cornerstonejs/dicom-image-loader codecs). Use when the app is served
 * under a subpath or you need to point WASM to a custom URL.
 *
 * Usage:
 * 1. Add the plugin with optional wasmBasePath:
 *    cornerstoneWasm({ wasmBasePath: '/subpath/' })
 * 2. In your app entry (e.g. main.tsx), before loading any images:
 *    import { getWasmBasePath } from 'virtual:cornerstone-wasm-config';
 *    import { setConfiguration } from '@cornerstonejs/core';
 *    const base = getWasmBasePath();
 *    if (base) setConfiguration({ wasmBasePath: base });
 *
 * If you don't use the virtual module, you can instead call
 * setConfiguration({ wasmBasePath: import.meta.env.BASE_URL }) for subpath support.
 */
export function vitePluginCornerstoneWasm(
  options: VitePluginCornerstoneWasmOptions = {}
): Plugin {
  const { wasmBasePath = '' } = options;

  return {
    name: 'vite-plugin-cornerstone-wasm',
    resolveId(id: string) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID;
      return null;
    },
    load(id: string) {
      if (id !== RESOLVED_VIRTUAL_MODULE_ID) return null;
      return `
export function getWasmBasePath() {
  return ${JSON.stringify(wasmBasePath)};
}
`;
    },
  };
}

export default vitePluginCornerstoneWasm;
