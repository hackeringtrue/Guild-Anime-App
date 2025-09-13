// Custom shim for import.meta to work in web environment
const importMetaShim = {
  url: typeof window !== 'undefined' ? window.location.href : 'file://',
  env: {
    MODE: 'development',
    DEV: true,
    PROD: false,
    SSR: false,
  },
};

export default importMetaShim;