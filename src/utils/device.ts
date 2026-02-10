export function getDeviceId() {
  let id = localStorage.getItem("mangni_device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("mangni_device_id", id);
  }
  return id;
}
