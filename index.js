import RequestHandler from "./lib/RequestHandler";

export default class uniRequest {
  env = process.env.NODE_ENV == "delepment";
  allResult;
  statusCode;
  result = {};
  static loading = true;
  static loadingText = "加载中。。。";
  timeout = 6000;
  reason = "";
  method = "GET";
  config = {
    // 是整个请求的基本配置
    baseUrl: "http://127.0.0.1:4523/m1/2670582-0-default",
    defaultParams: {}, // 配置请求的默认参数
    loadingText: "请稍等...",
    header: {}, // 请求头
  };
  // debug: console all params
  debugUrlSuffix;
  debugUrlparams;
  debugUrlResult;
  // 单个请求是否显示loading或者错误提醒

  testVar = "testa";

  constructor({
    isDebug = true, // 是否开启this.debug方法打印请求
    baseUrl = "http://127.0.0.1:4523/m1/2670582-0-default",
    defaultParams = {}, // 配置请求的默认参数
    loadingText = "请稍等...",
    header = {}, // 请求头
  } = {}) {
    this.config.isDebug = isDebug;
    this.config.baseUrl = baseUrl;
    this.config.defaultParams = defaultParams;
    this.config.loadingText = loadingText;
    this.config.header = header;
  }

  async warn(
    args = {
      title: "提示", // 确认/取消弹窗model 的标题
      content: "是否继续该操作？", // mode的内容部分
    },
    confirmFn,
    cancelFn
  ) {
    // console.log('warn');
    this.requestOptions.isShowSucToast &&
      uni.showModal({
        title: args.title,
        content: args.content,
        success: async (res) => {
          if (res.confirm) {
            confirmFn && (await confirmFn());
            this.tempSava();
          } else if (res.cancel) {
            cancelFn && (await cancelFn());
          }
        },
      });
  }

  async exec(url, data, nativeSettings = {}) {
    if (this.requestOptions.isOptimisticUpdateEnabled) {
      this.requestOptions.isShowLoading = false;
      this.requestOptions.isShowSucToast = false;
      this.requestOptions.isShowErrToast = true;
      this.requestOptions.failMsg = `操作失败，请稍后再试`;
    }
    // ------
    let status;
    return new Promise((resolve, reject) => {
      this.requestInterceptor();
      // console.log(this.config);
      setTimeout(() => {
        uni.request({
          url: `${this.config.baseUrl + url}`,
          data: {
            ...this.config.defaultParams,
            data,
          },
          header: {
            ...this.config.header,
            ...this.requestOptions.header,
          },
          timeout: this.timeout,
          success: (res) => {
            // console.log("suc", res);
            this.result = res.data;
            this.statusCode = res.data.code || res.statusCode; // 无论如何都会反
            if (res.data.code !== 200) return false;
            // this.
            status = "success";
            this.requestOptions.isShowSucToast &&
              uni.showToast({
                icon: "success",
                title: this.requestOptions.sucMsg,
              });
          },
          fail: (res) => {
            console.log("fail", res);
            if (res.data.code == 200) return false;
            status = "fail";
            reject({
              reason: this.reason,
              loading: this.loading,
              loadingText: this.loadingText,
              status: status,
            });
          },
          complete: async (res) => {
            this.allResult = res;
            // console.log('complete', res);
            this.debugUrlSuffix = url;
            this.debugUrlparams = {
              ...this.config.defaultParams,
              data,
            };
            this.debugUrlResult = res;
            this.reason = this.requestOptions.failMsg || res.data.errmsg;
            await this.responseInterceptor();
            if (this.statusCode != 200 || this.result.data.code != 200) {
              // console.log("❌请求错误");
              resolve({
                data: this.result,
                loading: this.loading,
                loadingText: this.loadingText,
                status: status,
              });
            }
          },
          ...nativeSettings,
        });
      }, 1000);
    });
  }

  requestInterceptor() {
    // console.log('请求拦截器执行', process.env.NODE_ENV);
    uni.getNetworkType({
      success(res) {
        // console.log("res.networkType: ", res.networkType);
        if (["none"].includes(res.networkType)) {
          uni.showModal({
            title: "没有网络",
            content: "请检查您的网络",
            showCancel: false,
            success: (res) => {
              uni.hideLoading();
            },
          });
          return false;
        }
      },
    });
    this.loading = true;
    this.requestOptions.isShowLoading &&
      uni.showLoading({
        title: this.config.loadingText,
        mask: true,
      });
  }

  responseInterceptor() {
    // console.log('响应拦截器执行', this.requestOptions);
    this.loading = false;
    this.loadingText = "到底了~";
    this.requestOptions.isShowLoading && uni.hideLoading();
    if (this.statusCode == 200) {
      this.debugApi("green");
    }
    this.err();
  }

  err(errField = "errmsg", duration = 1500, option) {
    let obj = {
      404: "请求路径不存在",
      502: "无效请求",
    };
    // console.log('err', this.statusCode, this.result.code);
    if (this.statusCode == 200) return false;
    // console.info("！！！错误提示：", this.reason, this.result);
    this.debugApi("red");
    this.requestOptions.isShowErrToast &&
      uni.showToast({
        icon: "error",
        title: obj[this.statusCode] || obj[this.result.code] || this.reason,
        duration,
        ...option,
      });
    return this;
  }

  debugApi(color = "green") {
    if (!this.requestOptions.isDebug) return false;
    console.group(
      `%c**********${this.method}请求-${this.debugUrlSuffix}-${
        color == "green" ? "成功" : "失败"
      }************`,
      `color:${color};font-size:20px`
    );
    console.log(`%c>>>传入参数 > `, `color:${color};`, this.debugUrlparams);
    console.log(`%c<<<响应结果 > `, `color:${color};`, this.debugUrlResult);
    console.log(`%c>>>all result > `, `color:${color};`, this.allResult);
    console.log(`%c>>>当前baseUrl > `, `color:${color};`, this.config.baseUrl);
    console.log(
      `%cend*********************************************/`,
      `color:${color};font-size:20px`
    );
    console.groupEnd();
  }

  requestOptions = {
    sucMsg: "执行成功",
    failMsg: "操作失败",
    isShowLoading: true,
    isShowSucToast: true,
    isShowErrToast: true,
    isOptimisticUpdateEnabled: false,
    header: {},
    isDebug: true,
    isWarn: false,
  };

  /**
   * This function sets the options for a request.
   *
   * @param {Object} options The options for the request.
   * @param {string} options.sucMsg The success message.
   * @param {string} options.failMsg The failure message.
   * @param {boolean} options.isShowLoading Flag to show/hide loading.
   * @param {boolean} options.isShowSucToast Flag to show/hide success toast.
   * @param {boolean} options.isShowErrToast Flag to show/hide error toast.
   * @param {boolean} options.isOptimisticUpdateEnabled Flag for enabling optimistic update.
   * @param {Object} options.header The header for the request.
   * @param {boolean} options.isDebug Flag for enabling/disabling debug.
   * @param {boolean} options.isWarn Poup a model.
   * @return {useAxios} The useAxios instance.
   */
  setOptions({
    sucMsg = "执行成功",
    failMsg = "操作失败",
    isShowLoading = true,
    isShowSucToast = true,
    isShowErrToast = true,
    isOptimisticUpdateEnabled = false,
    header = {},
    isDebug = true,
    isWarn = false,
  } = {}) {
    this.requestOptions.isWarn = isWarn;
    isWarn && this.warn();
    this.requestOptions.sucMsg = sucMsg;
    this.requestOptions.failMsg = failMsg;
    this.requestOptions.isShowLoading = isShowLoading;
    this.requestOptions.isShowSucToast = isShowSucToast;
    this.requestOptions.isShowErrToast = isShowErrToast;
    this.requestOptions.isOptimisticUpdateEnabled = isOptimisticUpdateEnabled;
    this.requestOptions.header = header;
    this.requestOptions.isDebug = isDebug;
    return this;
  }

  tempSava;

  requestHandler = new RequestHandler();
  async get(url, data, nativeSettings) {
    return this.requestHandler.get(this, url, data, nativeSettings);
  }

  async post(url, data, nativeSettings) {
    return this.requestHandler.post(this, url, data, nativeSettings);
  }

  async put(url, data, nativeSettings) {
    return this.requestHandler.put(this, url, data, nativeSettings);
  }

  async del(url, data, nativeSettings) {
    return this.requestHandler.del(this, url, data, nativeSettings);
  }
}
