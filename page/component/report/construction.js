const moment = require('moment');

const PLACE_HOLDER = '如果不知道请联系项目经理';

Page({
  data: {
    //项目号
    pcode: '',
    //项目号输入栏中的填写值
    value: '',
    //项目号是否确认
    confirm: false,
    //每一段工作内容为一个section
    section_id: 0,
    //项目号输入栏的提示文字
    place_holder: PLACE_HOLDER,
    //所选员工的工作情况
    chosen: {},
  },
  getMyinfo(){
    let pages = getCurrentPages();
    let prev_page = pages[pages.length - 2];
    let myinfo = prev_page.data.myinfo;
    return {...myinfo};
  },
  getSectionData(section_id){
    let pages = getCurrentPages();
    let prev_page = pages[pages.length - 2];
    let section_data = prev_page.data.section[section_id];
    return {...section_data};
  },
  saveSectionData(data, section_id){
    let pages = getCurrentPages();
    let prev_page = pages[pages.length - 2];
    let section = [...prev_page.data.section];
    section[section_id] = data;
    prev_page.setData({
      section : section
    });
  },
  onLoad(query){
    this.initData(query.section_id);
    
  },
  initData(section_id, clear = false){
    let section_data = this.getSectionData(section_id);
    let cons_data = section_data.cons;
    //初始化
    if(cons_data == undefined || clear == true){
      cons_data = {};
      cons_data.pcode = '';
      cons_data.value = '';
      cons_data.confirm = false;
      cons_data.chosen = {};
      let myinfo = this.getMyinfo();
      cons_data.chosen[myinfo.userid] = {
        start : section_data.start,
        end : section_data.end,
        name : myinfo.name,
        userid : myinfo.userid
      }
    }
    this.setData({
      section_id: section_id,
      pcode: cons_data.pcode,
      value: cons_data.value,
      confirm: cons_data.confirm,
      chosen: cons_data.chosen
    });
  },
  onCodeInput(e){
    console.log(e.detail.value);
    this.setData({
      pcode : e.detail.value,
      value : e.detail.value
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
      //currentDate: self.data.common_start,
      success: (res) => {
        console.log(res);
        //如果修改的是本人,同时修改主页的时间
        // if(e.target.dataset.id == self.data.myinfo.userid){
        //   let pages = getCurrentPages();
        //   let prev_page = pages[pages.length - 2];
        //   let section = [...prev_page.data.section];
        //   section[self.data.section_id]['start'] = res.date;
        //   prev_page.setData({
        //     section:section
        //   });
        // }
        let chosen = self.data.chosen;
        chosen[e.target.dataset.id].start = res.date;
        self.setData({
          chosen:chosen
        });
      },
    });
  },
  onChooseEndTime(e){
    console.log(e);
    let self = this;
    dd.datePicker({
      format: 'yyyy-MM-dd HH:mm',
      //currentDate: self.data.common_end,
      success: (res) => {
        console.log(res);
        //如果修改的是本人,同时修改主页的时间
        // if(e.target.dataset.id == self.data.myinfo.userid){
        //   let pages = getCurrentPages();
        //   let prev_page = pages[pages.length - 2];
        //   let section = [...prev_page.data.section];
        //   section[self.data.section_id]['end'] = res.date;
        //   prev_page.setData({
        //     section:section
        //   });
        // }
        let chosen = self.data.chosen;
        chosen[e.target.dataset.id].end = res.date;
        self.setData({
          chosen:chosen
        });
      },
    });
  },
  onAddWorkers(e){
    let self = this;
    let requiredUsers = [];
    for(let i in self.data.chosen){
     requiredUsers.push(i);
    }
    let myuserid = self.getMyinfo().userid;
    let start = this.data.chosen[myuserid].start;
    let end = this.data.chosen[myuserid].end;
    console.log(myuserid);
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
        //console.log('complexChoose success');
        //console.log(res);
        let tmp = {...self.data.chosen};
        //console.log(res.users.length);
        
        for(let i=0;i< res.users.length;i++){
          let name = res.users[i].name;
          let userid = res.users[i].userId;
          //console.log(name);
          tmp[userid] = {
            name:name,
            userid:userid,
            start:start,
            end:end,
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
    // let pages = getCurrentPages();
    // let prev_page = pages[pages.length - 2];
    // let section = [...prev_page.data.section];
    // // console.log(prev_page.data.section);
    // // console.log(pages);
    // // console.log(this.data.section_id);
    // // console.log(section);
    // section[this.data.section_id]['detail'] = {...this.data};
    // prev_page.setData({
    //   section:section
    // });


    let section_data = this.getSectionData(this.data.section_id);
    if(section_data.cons == undefined){
      section_data.cons = {};
    }
    section_data.cons.pcode = this.data.pcode;
    section_data.cons.value = this.data.value;
    section_data.cons.confirm = this.data.confirm;
    section_data.cons.chosen = {...this.data.chosen};
    //同步主页与本业的主人时间
    let my_info = this.getMyinfo();
    section_data.start = section_data.cons.chosen[my_info.userid].start;
    section_data.end = section_data.cons.chosen[my_info.userid].end;
    this.saveSectionData(section_data, this.data.section_id);
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
        //let section_data = self.getSectionData(self.data.section_id);
        //section_data.cons = undefined;
        //self.saveSectionData(section_data);
        self.initData(self.data.section_id, true);
      },
    });
  }
});

//TODO
//现有BUG:report页面与construction页面对于报送人的时间段不能统一.
//解决方案:重新设计report页面与construction页面的数据结构与交互