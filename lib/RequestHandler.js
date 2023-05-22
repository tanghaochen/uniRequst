// RequestHandler.js
export default class RequestHandler {
  async requestCommon(method, uniRequest, url, data, nativeSettings) {
    uniRequest.method = method;
    try {
      uniRequest.tempSava = async () =>
        await uniRequest.exec(url, data, nativeSettings);
      !uniRequest.requestOptions.isWarn && (await uniRequest.tempSava());
    } catch (e) {
      console.log(e);
      uniRequest.err();
      uniRequest.responseInterceptor();
    }
    return {
      data: uniRequest.result,
      loading: uniRequest.loading,
      loadingText: uniRequest.loadingText,
    };
  }

  async get(uniRequest, url, data, nativeSettings) {
    return this.requestCommon("GET", uniRequest, url, data, nativeSettings);
  }

  async post(uniRequest, url, data, nativeSettings) {
    return this.requestCommon("POST", uniRequest, url, data, nativeSettings);
  }

  async put(uniRequest, url, data, nativeSettings) {
    return this.requestCommon("PUT", uniRequest, url, data, nativeSettings);
  }

  async del(uniRequest, url, data, nativeSettings) {
    return this.requestCommon("DELETE", uniRequest, url, data, nativeSettings);
  }
}
