Page({
  data: {
    pcode: '',
    confirm: false,
  },
  onCodeInput(e){
    console.log(e.detail.value);
    this.setData({
      pcode : e.detail.value
    });
  },
  onCodeConfirm(){
    if(this.data.pcode == ''){
      return;
    }
    console.log(this.data.pcode);
    //验证项目号
    let self = this;
    dd.httpRequest({
      headers: {
        "Content-Type": "application/json"
      },
      url: 'http://139.196.211.108:3000/ddclient',
      method: 'POST',
      // 需要手动调用JSON.stringify将数据进行序列化
      data: JSON.stringify({
        code: 1,
        data: {
          number : self.data.pcode
        }
      }),
      dataType: 'json',
      success: function(res) {
        console.log(res);
        if(res.data == undefined){
          dd.alert({content: '服务器故障'});
          return;
        }
        //TODO 项目号录入错误时的处理
        let data = res.data.res;
        let show = '厂商:' + data.客户名称 +'\n' + '订单内容:' + data.订单内容 + '\n' + '项目经理:' + data.公司负责人
        dd.alert({content: show});
      },
      fail: function(res) {
        console.log(res);
        dd.alert({content: '验证失败,请检查网络'});
        self.setData({
          confirm : false
        });
      },
      // complete: function(res) {
      //   console.log(res);
      //   dd.alert({content: 'complete'});
      // }
    });
    this.setData({
      confirm : true
    });
  },
  onCodeRewrite(){
    this.setData({
      confirm : false
    });
  }
});
