let boysCache: any[] = [];
let girlsCache: any[] = [];

export const getBoysCache = () => boysCache;
export const setBoysCache = (data: any[]) => {
  boysCache = data;
};

export const getGirlsCache = () => girlsCache;
export const setGirlsCache = (data: any[]) => {
  girlsCache = data;
};