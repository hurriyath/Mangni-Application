let isExploreHandlingBack = false;

export const setExploreHandling = (value: boolean) => {
  isExploreHandlingBack = value;
};

export const getExploreHandling = () => {
  return isExploreHandlingBack;
};