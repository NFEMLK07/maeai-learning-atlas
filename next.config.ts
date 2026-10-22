import type {NextConfig} from 'next';

// TypeScript is checked separately by `npm run typecheck`.
// This avoids a TypeScript CLI probe issue in some constrained build hosts.
const config:NextConfig={typescript:{ignoreBuildErrors:true}};
export default config;
