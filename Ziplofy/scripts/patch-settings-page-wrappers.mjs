import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function walkTsx(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkTsx(p, acc);
    else if (ent.name.endsWith('.tsx')) acc.push(p);
  }
  return acc;
}

const settingsDir = path.join(root, 'src', 'pages', 'settings');
const extra = [
  path.join(root, 'src', 'pages', 'TransactionsPage.tsx'),
];

const files = [...walkTsx(settingsDir), ...extra].filter((f) => fs.existsSync(f));

/** @type { [string, string][] } */
const replacements = [
  [
    `    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6 py-6 px-4 pb-28">`,
    `    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6 pb-28">`,
  ],
  [
    `    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6 py-6 px-4">`,
    `    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">`,
  ],
  [
    `    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto py-6 px-4">`,
    `    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">`,
  ],
  [
    `    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1000px] mx-auto py-6 px-4">`,
    `    <div className="w-full">
      <div className="max-w-[1000px] mx-auto w-full flex flex-col gap-6">`,
  ],
  [
    `      <div className="min-h-screen bg-page-background-color">
        <div className="max-w-[1400px] mx-auto w-full py-6 px-4">`,
    `      <div className="w-full">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">`,
  ],
];

let total = 0;
for (const file of files) {
  let s = fs.readFileSync(file, 'utf8');
  const orig = s;
  s = s.replace(/\r\n/g, '\n');
  for (const [from, to] of replacements) {
    const n = s.split(from).length - 1;
    if (n) total += n;
    s = s.split(from).join(to);
  }
  if (s !== orig.replace(/\r\n/g, '\n')) {
    fs.writeFileSync(file, s, 'utf8');
    console.log('patched', path.relative(root, file));
  }
}
console.log('total replacements:', total);
