import axios from "axios";

const TABLE_URL = "/noco-api/api/v3/data/pxleh7p3llnfif4/mmvd47excbwbt2k";

const mapRecord = (record) => ({
  Id: record.id ?? record.Id,
  ...(record.fields || record),
});

export const listGames = (params = {}) =>
  axios.get(`${TABLE_URL}/records`, { params }).then((response) => {
    const records = response.data?.records || response.data?.list || [];
    return {
      games: records.map(mapRecord),
      hasNext: Boolean(response.data?.next),
    };
  });

export const addGame = (fields) =>
  axios.post(`${TABLE_URL}/records`, { fields });

export const updateGame = (id, fields) =>
  axios.patch(`${TABLE_URL}/records`, { id, fields });

export const deleteGame = (id) =>
  axios.delete(`${TABLE_URL}/records`, { data: { id } });
