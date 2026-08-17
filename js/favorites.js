import {loadJSON,saveJSON} from './utils.js';
const KEY='tb-favorites', RECENT='tb-recent';
export const favorites=()=>loadJSON(KEY,[]); export const isFavorite=id=>favorites().includes(id);
export function toggleFavorite(id){const x=favorites();const i=x.indexOf(id);i>=0?x.splice(i,1):x.push(id);saveJSON(KEY,x);return !isFavorite(id)}
export const recent=()=>loadJSON(RECENT,[]);
export function addRecent(id){let x=recent().filter(v=>v!==id);x.unshift(id);saveJSON(RECENT,x.slice(0,6));}
export function clearRecent(){localStorage.removeItem(RECENT)}
