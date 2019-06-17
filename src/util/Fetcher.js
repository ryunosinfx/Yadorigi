export class Fetcher {
  constructor(headerKeys) {
    this.headerKeys = headerKeys;
  }
  fetch(path, data = {}, isPost = false, isBlob = false) {}
}
