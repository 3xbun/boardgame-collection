import axios from "axios";
import { xml2js } from "xml-js";

const API_URL = "/bgg-api";

const asArray = (value) => (value ? (Array.isArray(value) ? value : [value]) : []);

const valueOf = (value) => value?._attributes?.value ?? value?._text ?? "";

const normalizeItem = (item) => {
  const attributes = item?._attributes || {};
  const names = asArray(item?.name).map((name) => ({
    ...name._attributes,
    value: valueOf(name),
  }));
  const links = asArray(item?.link).map((link) => ({
    ...link._attributes,
    value: valueOf(link),
  }));

  return {
    ...attributes,
    name: names,
    yearpublished: item?.yearpublished?._attributes,
    image: valueOf(item?.image),
    thumbnail: valueOf(item?.thumbnail),
    description: valueOf(item?.description),
    minplayers: item?.minplayers?._attributes,
    maxplayers: item?.maxplayers?._attributes,
    playingtime: item?.playingtime?._attributes,
    minplaytime: item?.minplaytime?._attributes,
    maxplaytime: item?.maxplaytime?._attributes,
    minage: item?.minage?._attributes,
    link: links,
  };
};

const requestXml = (path, params) =>
  axios
    .get(`${API_URL}/${path}`, { params, responseType: "text" })
    .then((response) => xml2js(response.data, { compact: true }));

export const searchBoardGames = (query) =>
  requestXml("search", { query, type: "boardgame" }).then((xml) =>
    Promise.all(asArray(xml?.items?.item).map(async (item) => {
      const normalized = normalizeItem(item);
      const searchItem = { ...normalized, name: normalized.name[0] || {} };

      try {
        const details = await getBoardGame(normalized.id);
        return {
          ...searchItem,
          thumbnail: details?.thumbnail || details?.image || "",
        };
      } catch {
        return searchItem;
      }
    })),
  );

export const getBoardGame = (id) =>
  requestXml("thing", { id, stats: 1 }).then((xml) => {
    const item = xml?.items?.item;
    return item ? normalizeItem(item) : null;
  });
