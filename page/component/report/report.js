const moment = require('moment');

Page({
  data: {
    //是否已提交
    commit: false,
    //默认工作持续时间
    common_duration: '',
    //默认工作开始时间
    common_start: '',
    //默认工作结束时间
    common_end: '',
    //每一段工作内容为一个construction的data,各个data组成了一个section
    /*
    @section结构
    id : int
    data : obj
    
    @data结构
    start : string, 工作开始时间
    end : string, 工作结束时间
    work : string, 工作内容
    cons : obj, [明细]中的内容

    @cons结构
    pcode : string, 项目号
    value : string, 项目号输入栏中的实际填写值
    confirm : bool, 项目号是否确认
    section_id : int, 该cons所属的data在section数组中的序号
    chosen : obj组成的array, 所选员工的工作情况

    @chosen中obj的结构
    userid : string, 钉钉userid
    name : string
    start : string, 工作开始时间
    end : string, 工作结束时间
    */
    section: [],
    //app使用者的自身信息
    myinfo: {},
  },
  onLoad(){
    let today = moment().format('YYYY-MM-DD');
    let common_start = today + ' 08:00';
    let common_end = today + ' 17:00';
    let tmp = [];
    let self = this;
    dd.getStorage({
      key: 'myinfo',
      success: function(res){
        let myinfo = res.data;
        self.setData({
          myinfo: {...myinfo}
        });
      },
      fail: (res)=>{
        console.log(res);
        dd.alert({content: res.errorMessage});
      }
    });
    tmp.push({
      start: common_start,
      end: common_end,
    });
    this.setData({
      common_start: common_start,
      common_end: common_end,
      section: tmp,
      
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
        let tmp = [...self.data.section];
        tmp[e.target.dataset.id].start = res.date;
        self.setData({
          section: tmp
        });
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
        let tmp = [...self.data.section];
        tmp[e.target.dataset.id].end = res.date
        self.setData({
          section: tmp
        });
      },
    });
  },
  radioChange(e){
    console.log(e);
    let tmp = [...this.data.section];
    tmp[e.target.dataset.id]['work'] = e.detail.value;
    if(e.detail.value == '项目施工'){
      tmp[e.target.dataset.id]['cons_selected'] = true;
    }else{
      tmp[e.target.dataset.id]['cons_selected'] = false;
    }
    this.setData({
      section: tmp,
    })
  },
  onConsDetail(e){
    console.log(e);
    
    dd.navigateTo({
      url: './construction?section_id=' + e.target.dataset.id,
    })
  },
  onAddSection(e){
    let self = this;
    dd.confirm({
      title: '提示',
      content: '添加工作内容?',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      success: (result) => {
        if(result.confirm == false){
          return;
        }
        console.log(e);
        let tmp = [...self.data.section];
        tmp.push({
          start: self.data.common_start,
          end: self.data.common_end,
        });
        self.setData({
          section:tmp
        });
      },
    });
    
  },
  onSubmit(e){
    console.log(e);
    dd.confirm({
      title: '提示',
      content: '是否汇报今日工作?',
      confirmButtonText: '是',
      cancelButtonText: '再检查一下',
      success: (result) => {
        if(result.confirm == false){
          return;
        }
        let self = this;
        //TODO 校验
        for(let i = 0; i < self.data.section.length; i++){
          if(self.data.section[i].work == '项目施工' && (self.data.section[i].cons == undefined || self.data.section[i].cons.confirm != true)){
            dd.alert({content: '当所选内容为[项目施工]时,请在[明细]中确认项目号'});
            //console.log(self.data.section);
            return;
          }
        }
        
        dd.httpRequest({
          headers: {
            "Content-Type": "application/json"
          },
          url: 'http://139.196.211.108:3000/ddclient',
          method: 'POST',
          // 需要手动调用JSON.stringify将数据进行序列化
          data: JSON.stringify({
            code: 3,
            data: {
              myinfo: self.data.myinfo,
              section: self.data.section,
            }
          }),
          dataType: 'json',
          success: function(res) {
            console.log(res);
            let show = '上传成功';
            dd.alert({content: show});
            self.setData({
              commit : true,
            });
          },
          fail: function(res) {
            console.log(res);
            switch(res.status){
              case(450):{
                dd.alert({content: '你所选择的人员中,有人尚未分配工号,请联系管理员处理'});
              }
              break;
              case(451):{
                dd.alert({content: '你已经提交过' + res.data.res + '的工作日志了'});
              }
              break;
              case(452):{
                dd.alert({content: res.data.res});
              }
              break;
              default:{
                dd.alert({content: '提交失败,请检查网络'});
              }
            }
          },
          // complete: function(res) {
          //   console.log(res);
          //   dd.alert({content: 'complete'});
          // }
        });
      },
    });
    
  }
});