let gid = 1;

export function uid(prefix = "wb") {
  gid += 1;
  return `${prefix}_${gid.toString(36)}_${Date.now().toString(36)}`;
}
