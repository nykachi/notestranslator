export const formatDate = (ms) => {
  const date = new Date(ms);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hrs = date.getHours();
  const min = date.getMinutes();
  const sec = date.getSeconds();

  return `${day}/${month}/${year} - ${hrs}:${addLeadingZero(
    min
  )}:${addLeadingZero(sec)}`;
};

const addLeadingZero = (val) => {
  return ('0' + val).slice(-2);
};
