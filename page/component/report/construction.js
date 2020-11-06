const moment = require('moment');

//TODO 修改时间的统一

const PLACE_HOLDER = '请输入6位数字';

Page({
  data: {
    pcode: '',
    value: '',
    confirm: false,
    common_duration: '',
    common_start: '',
    common_end: '',
    section_id: 0,
    place_holder: PLACE_HOLDER,
    first_open: true,
    chosen: {},
    myinfo: {},
  },
  initData(){
    let self = this;
    dd.getStorage({
      key: 'myinfo',
      success: function(res){
        let myinfo = res.data;
        let chosen = {};
        chosen[myinfo.userid] = {
          start: self.data.common_start,
          end: self.data.common_end,
          name: myinfo.name,
          userid: myinfo.userid
        };
        self.setData({
          first_open: false,
          chosen: {...chosen},
          myinfo: {...myinfo}
        });
      },
      fail: (res)=>{
        console.log(res);
        dd.alert({content: res.errorMessage});
      }
    });
  },
  onLoad(query){
    let written = JSON.parse(query.obj);
    console.log(written);
    this.setData({
      section_id: written.detail.section_id,
      common_start: written.start,
      common_end: written.end,
    });
    if(written.detail.first_open == false){
      console.log(written);
      this.setData({
        pcode: written.detail.pcode,
        confirm: written.detail.confirm,
        chosen: {...written.detail.chosen},
        first_open: written.detail.first_open,
        value: written.detail.pcode,
        myinfo: {...written.myinfo}
      });
    }else{
      // let today = moment().format('YYYY-MM-DD');
      // let common_start = today + ' 08:00';
      // let common_end = today + ' 17:00';
      //将自己作为已选择的作业人员
      this.initData();
    }
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
      confirm : false,
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
    let requiredUsers = [];
    for(let i in self.data.chosen){
     requiredUsers.push(i);
    }
    dd.complexChoose({
      title:"选取作业人员",            //标题
      multiple:true,            //是否多选
      limitTips:"超出了限定人数",          //超过限定人数返回提示
      maxUsers:1000,            //最大可选人数
      pickedUsers:[],            //已选用户
      pickedDepartments:[],          //已选部门
      disabledUsers:[],            //不可选用户
      disabledDepartments:[],        //不可选部门
      requiredUsers:requiredUsers,            //必选用户（不可取消选中状态）
      requiredDepartments:[],        //必选部门（不可取消选中状态）
      permissionType:"GLOBAL",          //可添加权限校验，选人权限，目前只有GLOBAL这个参数
      responseUserOnly:true,    
      success: (res)=>{
        console.log('complexChoose success');
        console.log(res);
        let tmp = {...self.data.chosen};
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
  },
  onBack(){
    let pages = getCurrentPages();
    let prev_page = pages[pages.length - 2];
    let section = [...prev_page.data.section];
    console.log(prev_page.data.section);
    console.log(pages);
    console.log(this.data.section_id);
    console.log(section);
    section[this.data.section_id]['detail'] = {...this.data};
    prev_page.setData({
      section:section
    });
    dd.navigateBack({
      delta: 1
    });
  },
  onReload(){
    let self = this;
    dd.confirm({
      title: '提示',
      content: '确认重置作业人员?',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      success: (result) => {
        if(result.confirm == false){
          return;
        }
        self.setData({
          chosen:{},
        });
        self.initData();
      },
    });
  }
});
