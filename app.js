App({
  onLaunch(options) {
    console.log('App Launch', options);
    console.log('getSystemInfoSync', dd.getSystemInfoSync());
    console.log('SDKVersion', dd.SDKVersion);
    dd.getAuthCode({
      success:(res)=>{
        console.log(res);
        //向JY服务端请求用户信息
        dd.httpRequest({
        headers: {
          "Content-Type": "application/json"
        },
        url: 'http://139.196.211.108:3000/ddclient',
        method: 'POST',
        // 需要手动调用JSON.stringify将数据进行序列化
        data: JSON.stringify({
          code: 2,
          data: {
            authcode : res.authCode
          }
        }),
        dataType: 'json',
        success: function(res) {
          console.log(res);
          
          if(res.data == undefined){
            dd.alert({content: '服务器故障'});
            return;
          }
          dd.setStorage({
            key: 'myinfo',
            data: {
              userid: res.data.res.userid,
              name: res.data.res.name
            }
          });
        },
        fail: function(res) {
          console.log(res);
          dd.alert({content: '请求个人信息故障,请检查网络'});
        }
      });
     }
    })
  },
  onShow() {
    console.log('App Show');
  },
  onHide() {
    console.log('App Hide');
  },
  globalData: {
    hasLogin: false,
    userid: ''
  },

});
