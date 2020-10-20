const moment = require('moment');

Page({
  data: {
    pcode: '',
    confirm: false,
    common_duration: '',
    common_start: '',
    common_end: '',
    chosen: {},
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
        if(e.target.dataset.id == undefined){
          self.setData({
            common_start : res.date,
          });
        }
        else{
          let chosen = self.data.chosen;
          chosen[e.target.dataset.id].start = res.date;
          self.setData({
            chosen:chosen
          });
        }
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
        if(e.target.dataset.id == undefined){
          self.setData({
            common_end : res.date,
          });
        }
        else{
          let chosen = self.data.chosen;
          chosen[e.target.dataset.id].end = res.date;
          self.setData({
            chosen:chosen
          });
        }
      },
    });
  },
  onAddWorkers(e){
    let self = this;
    let picked = [];
    for(let i in self.data.chosen){
      //console.log(i);
      picked.push(i);
    }
    dd.complexChoose({
      title:"选取作业人员",            //标题
      multiple:true,            //是否多选
      limitTips:"超出了限定人数",          //超过限定人数返回提示
      maxUsers:1000,            //最大可选人数
      pickedUsers:picked,            //已选用户
      pickedDepartments:[],          //已选部门
      disabledUsers:[],            //不可选用户
      disabledDepartments:[],        //不可选部门
      requiredUsers:[],            //必选用户（不可取消选中状态）
      requiredDepartments:[],        //必选部门（不可取消选中状态）
      permissionType:"GLOBAL",          //可添加权限校验，选人权限，目前只有GLOBAL这个参数
      responseUserOnly:true,    
      success: (res)=>{
        console.log('complexChoose success');
        console.log(res);
        let tmp = {};
        console.log(res.users.length);
        for(let i=0;i< res.users.length;i++){
          let name = res.users[i].name;
          let userid = res.users[i].userId;
          console.log(name);
          tmp[userid] = {
            name:name,
            userid:userid,
            start:self.data.common_start,
            end:self.data.common_end,
          };
        }
        self.setData({
            chosen:tmp
        });
        console.log('self.data.chosen:');
        console.log(self.data.chosen);
      },
      fail: (res)=>{
        console.log('complexChoose fail');
        console.log(res);
      },
    });
  }
  //TODO 提交(时间检查,cofirm,)
});
