const moment = require('moment');

Page({
  data: {
    pcode: '',
    confirm: false,
    common_duration: '',
    common_start: '',
    common_end: '',
  },
  onLoad(){
    let today = moment().format('YYYY-MM-DD');
    let common_start = today + ' 08:00';
    let common_end = today + ' 17:00';
    this.setData({
      common_start: common_start,
      common_end: common_end
    });
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
          self.setData({
            confirm : false
          });
          return;
        }
        let data = res.data.res;
        //项目号录入错误时的处理
        if(data == undefined){
          dd.alert({content: '该项目号不存在,请联系项目经理确认'});
          self.setData({
            confirm : false
          });
          return;
        }
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
  },
  onChooseStartTime(e){
    console.log(e);
    let self = this;
    dd.datePicker({
      format: 'yyyy-MM-dd HH:mm',
      currentDate: self.data.common_start,
      success: (res) => {
        console.log(res);
        self.setData({
          common_start : res.date,
        })
      },
    });
  },
  onChooseEndTime(e){
    console.log(e);
    let self = this;
    dd.datePicker({
      format: 'yyyy-MM-dd HH:mm',
      currentDate: self.data.common_end,
      success: (res) => {
        console.log(res);
        self.setData({
          common_end : res.date,
        })
      },
    });
  },
});
